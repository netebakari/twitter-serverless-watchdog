import * as AWS from "aws-sdk";
import * as LambdaType from "aws-lambda";
import * as Types from "./types";
import * as env from "./env";
import TwitterClient from "./twitterClient";
import ConfigOnDynamoDb from "./configOnDynamoDb";

const s3 = new AWS.S3();

const updateS3text = async (text: string): Promise<void> => {
  const params = {
    Body: text,
    Bucket: env.s3.bucket,
    Key: env.s3.keyName,
    ContentType: "text/plain; charset=utf-8",
    ACL: "public-read-write",
  };
  await s3.putObject(params).promise();
};

/**
 * エントリーポイント
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.handler = async (event: any, context: LambdaType.Context): Promise<boolean> => {
  // DynamoDB上の設定を読み書きするクラス。引数で dryRun にtrueが指定されていたら更新は行わない
  const configOnDynamoDb = new ConfigOnDynamoDb(event.dryRun);
  const configOnDb = await configOnDynamoDb.getConfig();
  console.log("設定を取得しました");

  // Twitterクライアント（のラッパー）を生成。引数で dryRun にtrueが指定されていたらツイート送信は行わない
  const twitterClient = new TwitterClient(configOnDb.token, event.dryRun);

  if (event.dryRun) {
    console.log("S3の更新はスキップします");
  } else {
    console.log("検索キーワードを列挙したテキストファイルを更新します");
    await updateS3text(configOnDb.keywords.join("\r\n"));
  }

  // 見つかったツイートとその理由をここに入れる
  const founds: { tweet: Types.Tweet; keyword: string }[] = [];
  let maxId = configOnDb.lastId ?? "1000000000000000000";

  for (const screenName of configOnDb.screenNames) {
    // DynamoDB上の設定で指定されたアカウントごとにツイートを適当に取得
    let tweets: Types.Tweet[] = [];
    try {
      tweets = await twitterClient.getRecentTweets(screenName, env.tweetsCountToRetrieve, configOnDb.lastId);
    } catch (e) {
      console.error(`${screenName}のツイート取得に失敗しました。0件取得したものとして処理は継続します`);
    }

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
    const accounts = configOnDb.screenNames.map((x) => `@${x}`).join(", ");
    const text = [
      `${configOnDb.lastId}以降のチェックを行い、${founds.length}件の監視対象ツイートが見つかりました。 @null宛で引用RTします。`,
      `現在の監視アカウント: ${accounts}`,
      `現在の監視キーワード: https://${env.s3.bucket}.s3-${env.s3.region}.amazonaws.com/${env.s3.keyName}`,
    ].join("\n");
    await twitterClient.sendTweet(text);

    for (const found of founds) {
      await twitterClient.sendTweet(
        `@null 理由: "${found.keyword}"にマッチしました\n${TwitterClient.tweetToStatusUrl(found.tweet)}`
      );
    }

    // 最終ステータスID更新
    await configOnDynamoDb.updateSinceId(maxId);
  }

  return true;
};
