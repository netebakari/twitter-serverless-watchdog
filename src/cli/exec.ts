/**
 * コマンドラインからの実行用。実際のツイート、S3/DynamoDBの更新はしない
 */

const hoge = require("../index")

const func = async (event) => {
    try {
        const result = await hoge.handler(event);
        console.log("OK!");
        console.log(result);
    }
    catch (e) {
        console.log("ERROR!");
        console.log(e);
    }
};

func({
    dryRun: true // trueを明示的に指定するとツイート送信は行わない（取得はやる）
});
