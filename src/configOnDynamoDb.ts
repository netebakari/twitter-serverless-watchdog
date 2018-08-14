import * as Config from "./config"
import * as AWS from "aws-sdk"
import * as Types from "./types"
import * as _ from "lodash"
const dynamo = new AWS.DynamoDB.DocumentClient({region: Config.dynamoDb.region});

/**
 * DynamoDBの設定を読み書きするクラス
 */
export default class ConfigOnDynamoDb {
    private dryRun: boolean;
    private record: Types.ConfigRecordType;

    constructor(dryRun: boolean = false) {
        this.dryRun = !!dryRun;
    }

    /**
     * DynamoDB上の設定レコードを取得する。内部に元の値を保持しているので値を書き換えても特に影響はない
     */
    async getConfig() {
        const data = await dynamo.query({
            TableName: Config.dynamoDb.tableName,
            KeyConditionExpression: '#key = :val',
            ExpressionAttributeNames: {"#key": Config.dynamoDb.keyName},
            ExpressionAttributeValues: {':val': Config.dynamoDb.keyValue},
        }).promise();
    
        if (!data || !Array.isArray(data.Items) || data.Items.length === 0) {
            throw new Error("レコードが取れません");
        }
    
        this.record = data.Items[0] as Types.ConfigRecordType;
        return _.cloneDeep(this.record);
    }
    
    /**
     * DynamoDB上の設定レコードの中のsinceId（レコード上はlastId）を更新する
     */
    async updateSinceId(sinceId: string) {
        if (this.dryRun) {
            console.log("DynamoDBの更新はスキップします");
        } else {
            console.log(`DynamoDBを更新します: sinceId=${sinceId}`);
            this.record.lastId = sinceId;
            await dynamo.put({TableName : Config.dynamoDb.tableName, Item: this.record}).promise();
        }
    }
    
}
