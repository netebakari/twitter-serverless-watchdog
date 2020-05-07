/**
 * コマンドラインからのテストツイート送信を行う
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
import TwitterClient from "../twitterClient";
import * as env from "../env";
import ConfigOnDynamoDb from "../configOnDynamoDb";

const testTweet = async () => {
  try {
    const configOnDynamoDb = new ConfigOnDynamoDb(
      process.argv[2],
      env.dynamoDbTableName,
      env.dynamoDbKeyName,
      env.dynamoDbKeyValue,
      true
    );
    const config = await configOnDynamoDb.getConfig();
    const client = new TwitterClient(config.token);
    console.log("Record on DynamoDB:");
    console.log(config);
    await client.sendTweet(`@null this is a test tweet from my client at ${new Date().toUTCString()}`);
    console.log("OK!");
  } catch (e) {
    console.log("ERROR!");
    console.log(e);
  }
};

testTweet();
