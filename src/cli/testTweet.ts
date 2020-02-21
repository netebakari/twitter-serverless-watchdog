/**
 * コマンドラインからのテストツイート送信を行う
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hoge = require("../index");
import TwitterClient from "../twitterClient";
import * as Config from "../config";

const testTweet = async () => {
  try {
    const client = new TwitterClient(Config.twitterToken);
    await client.sendTweet("@null this is a test tweet from my client.");
    console.log("OK!");
  } catch (e) {
    console.log("ERROR!");
    console.log(e);
  }
};

testTweet();
