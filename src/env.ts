import * as dotenv from "dotenv";
dotenv.config();

const getEnv = (name: string): string => {
  const result = process.env[name];
  if (result === undefined) {
    throw new Error(`environment variable "${name}" not defined`);
  }
  return result;
};

const dynamoDb = {
  tableName: getEnv("dynamoDbTableName"),
  keyName: getEnv("dynamoDbKeyName"),
  keyValue: getEnv("dynamoDbKeyValue"),
  region: getEnv("region"),
};

const s3 = {
  bucket: getEnv("s3BucketName"),
  keyName: getEnv("s3KeywordKeyName"),
  region: getEnv("region"),
};

const tweetsCountToRetrieve = 40;

export { dynamoDb, s3, tweetsCountToRetrieve };
