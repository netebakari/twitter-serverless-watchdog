/**
 * コマンドラインからのテストツイート送信を行う
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hoge = require("../index");
import TwitterClient from "../twitterClient";
import * as env from "../env";
import ConfigOnDynamoDb from "../configOnDynamoDb";

const testTweet = async () => {
  try {
    const configOnDynamoDb = new ConfigOnDynamoDb(true);
    const config = await configOnDynamoDb.getConfig();
    const client = new TwitterClient(config.token);
    await client.sendTweet("@null this is a test tweet from my client.");
    console.log("OK!");
  } catch (e) {
    console.log("ERROR!");
    console.log(e);
  }
};

testTweet();
