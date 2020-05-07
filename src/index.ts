import * as AWS from "aws-sdk";
import * as LambdaType from "aws-lambda";
import * as Types from "./types";
import * as env from "./env";
import TwitterClient from "./twitterClient";
import ConfigOnDynamoDb from "./configOnDynamoDb";

const s3 = new AWS.S3();

const updateS3text = async (bucketName: string, key: string, text: string): Promise<void> => {
  const params = {
    Body: text,
    Bucket: bucketName,
    Key: key,
    ContentType: "text/plain; charset=utf-8",
    ACL: "public-read",
  };
  await s3.putObject(params).promise();
};

/**
 * エントリーポイント
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.handler = async (event: any, context: LambdaType.Context): Promise<boolean> => {
  // ARNからリージョンを取り出す
  // arn:aws:lambda:ap-northeast-1:999999999999:function:FUNCTIONNAME
  const region = context.invokedFunctionArn.split(":")[3];

  // DynamoDB上の設定を読み書きするクラス。引数で dryRun にtrueが指定されていたら更新は行わない
  const configClient = new ConfigOnDynamoDb(
    region,
    env.dynamoDbTableName,
    env.dynamoDbKeyName,
    env.dynamoDbKeyValue,
    event.dryRun
  );
  const config = await configClient.getConfig();
  console.log("設定を取得しました");

  // Twitterクライアント（のラッパー）を生成。引数で dryRun にtrueが指定されていたらツイート送信は行わない
  const twitterClient = new TwitterClient(config.token, event.dryRun);

  if (event.dryRun) {
    console.log("S3の更新はスキップします");
  } else {
    console.log("検索キーワードを列挙したテキストファイルを更新します");
    await updateS3text(config.s3.bucket, config.s3.key, config.keywords.join("\r\n"));
  }

  // 見つかったツイートとその理由をここに入れる
  const founds: { tweet: Types.Tweet; keyword: string }[] = [];
  const lastId = config.lastId ?? "1000000000000000000";
  let maxId = lastId;

  for (const screenName of config.screenNames) {
    // DynamoDB上の設定で指定されたアカウントごとにツイートを適当に取得
    let tweets: Types.Tweet[] = [];
    try {
      tweets = await twitterClient.getRecentTweets(screenName, env.tweetsCountToRetrieve, lastId);
    } catch (e) {
      console.error(`${screenName}のツイート取得に失敗しました。0件取得したものとして処理は継続します`);
    }

    console.log(`${lastId}より後のツイートを${tweets.length}件取得`);
    for (const tweet of tweets) {
      if (maxId < tweet.id_str && maxId.length <= tweet.id_str.length) {
        maxId = tweet.id_str;
      }
      for (const keyword of config.keywords) {
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
    const accounts = config.screenNames.map((x) => `@${x}`).join(", ");
    const text = [
      `${lastId}以降のチェックを行い、${founds.length}件の監視対象ツイートが見つかりました。 @null宛で引用RTします。`,
      `現在の監視アカウント: ${accounts}`,
      `現在の監視キーワード: https://${config.s3.bucket}.s3-${region}.amazonaws.com/${config.s3.key}`,
    ].join("\n");
    await twitterClient.sendTweet(text);

    for (const found of founds) {
      await twitterClient.sendTweet(
        `@null 理由: "${found.keyword}"にマッチしました\n${TwitterClient.tweetToStatusUrl(found.tweet)}`
      );
    }

    // 最終ステータスID更新
    await configClient.updateSinceId(maxId);
  }

  return true;
};
