import * as AWS from "aws-sdk";
import * as Types from "./types";

type QueryParameterType = {
  TableName: string;
  KeyConditionExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: string };
};

/**
 * DynamoDBの設定を読み書きするクラス
 */
export default class ConfigOnDynamoDb {
  private queryParameter: QueryParameterType;
  private tableName: string;
  private client: AWS.DynamoDB.DocumentClient;
  private record: Types.ConfigRecord | undefined;
  private dryRun: boolean;

  constructor(region: string, tableName: string, keyName: string, keyValue: string, dryRun = false) {
    this.queryParameter = {
      TableName: tableName,
      KeyConditionExpression: "#key = :val",
      ExpressionAttributeNames: { "#key": keyName },
      ExpressionAttributeValues: { ":val": keyValue },
    };
    this.tableName = tableName;
    this.client = new AWS.DynamoDB.DocumentClient({ region });
    this.dryRun = dryRun;
  }

  /**
   * DynamoDB上の設定レコードを取得して返す。内部に元の値を保持しているので値を書き換えても特に影響はない
   */
  async getConfig(): Promise<Types.ConfigRecord> {
    const data = await this.client.query(this.queryParameter).promise();

    if (!data || !Array.isArray(data.Items) || data.Items.length === 0) {
      throw new Error("レコードが取れません");
    }

    const record = data.Items[0];
    Types.AssertsConfigRecord(record);

    this.record = record;
    return JSON.parse(JSON.stringify(this.record)) as Types.ConfigRecord;
  }

  /**
   * DynamoDB上の設定レコードの中のsinceId（レコード上はlastId）を更新する
   */
  async updateSinceId(sinceId: string): Promise<void> {
    if (this.record === undefined) {
      throw new Error("call getConfig() first");
    }

    if (this.dryRun) {
      console.log("DynamoDBの更新はスキップします");
    } else {
      console.log(`DynamoDBを更新します: sinceId=${sinceId}`);
      this.record.lastId = sinceId;
      await this.client.put({ TableName: this.tableName, Item: this.record }).promise();
    }
  }
}
