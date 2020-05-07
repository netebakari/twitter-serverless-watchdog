/**
 * コマンドラインからの実行用。実際のツイート、S3/DynamoDBの更新はしない
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hoge = require("../index");

const func = async (event: any, context: any) => {
  try {
    const result = await hoge.handler(event, context);
    console.log("OK!");
    console.log(result);
  } catch (e) {
    console.log("ERROR!");
    console.log(e);
  }
};

func(
  {
    dryRun: true,
  },
  {
    invokedFunctionArn: `arn:aws:lambda:${process.argv[2]}:999999999999:function:FUNCTIONNAME`,
  }
);
