import * as AWS from "aws-sdk";
import * as LambdaType from "aws-lambda";
import * as Types from "./types";
import * as Config from "./config";
import TwitterClient from "./twitterClient";
import ConfigOnDynamoDb from "./configOnDynamoDb";

const dynamo = new AWS.DynamoDB.DocumentClient({ region: Config.dynamoDb.region });
const s3 = new AWS.S3();

const updateS3text = async (text: string) => {
  const params = {
    Body: text,
    Bucket: Config.s3.bucket,
    Key: Config.s3.keyName,
    ContentType: "text/plain; charset=utf-8",
    ACL: "public-read-write"
  };
  await s3.putObject(params).promise();
};

/**
 * エントリーポイント
 */
exports.handler = async (event: any, context: LambdaType.Context) => {
  // Twitterクライアント（のラッパー）を生成。引数で dryRun にtrueが指定されていたらツイート送信は行わない
  const twitterClient = new TwitterClient(Config.twitterToken, event.dryRun);

  // DynamoDB上の設定を読み書きするクラス。引数で dryRun にtrueが指定されていたら更新は行わない
  const configOnDynamoDb = new ConfigOnDynamoDb(event.dryRun);

  const configOnDb = await configOnDynamoDb.getConfig();
  console.log("設定を取得しました");
  console.log(configOnDb);

  if (event.dryRun) {
    console.log("S3の更新はスキップします");
  } else {
    console.log("検索キーワードを列挙したテキストファイルを更新します");
    await updateS3text(configOnDb.keywords.join("\r\n"));
  }

  // 見つかったツイートとその理由をここに入れる
  const founds: { tweet: Types.Tweet; keyword: string }[] = [];
  let maxId = configOnDb.lastId;

  for (const screenName of configOnDb.screenNames) {
    // DynamoDB上の設定で指定されたアカウントごとにツイートを適当に取得
    const tweets = await twitterClient.getRecentTweets(screenName, Config.tweetsCountToRetrieve, configOnDb.lastId);
    console.log(`${configOnDb.lastId}より後のツイートを${tweets.length}件取得`);
    for (const tweet of tweets) {
      if (maxId < tweet.id_str && maxId.length <= tweet.id_str.length) {
        maxId = tweet.id_str;
      }
      for (const keyword of configOnDb.keywords) {
        const pattern = new RegExp(keyword);
        if (tweet.full_text.match(pattern)) {
          founds.push({ tweet, keyword });
          break;
        }
      }
    }
  }
  console.log(`更新後のsinceId: ${maxId}`);

  if (founds.length > 0) {
    const accounts = configOnDb.screenNames.map(x => `@${x}`).join(", ");
    const text = [
      `${configOnDb.lastId}以降のチェックを行い、${founds.length}件の監視対象ツイートが見つかりました。 @null宛で引用RTします。`,
      `現在の監視アカウント: ${accounts}`,
      `現在の監視キーワード: https://${Config.s3.region}.amazonaws.com/${Config.s3.bucket}/${Config.s3.keyName}`
    ].join("\n");
    await twitterClient.sendTweet(text);

    for (const found of founds) {
      await twitterClient.sendTweet(
        `@null 理由: "${found.keyword}"にマッチしました\n${TwitterClient.tweetToStatusUrl(found.tweet)}`
      );
    }
  }

  // 最終ステータスID更新
  await configOnDynamoDb.updateSinceId(maxId);
  return true;
};
