import * as dotenv from "dotenv";
dotenv.config();

const getEnv = (name: string): string => {
  const result = process.env[name];
  if (result === undefined) {
    throw new Error(`environment variable "${name}" not defined`);
  }
  return result;
};

const dynamoDbTableName = getEnv("dynamoDbTableName");
const dynamoDbKeyName = getEnv("dynamoDbKeyName");
const dynamoDbKeyValue = getEnv("dynamoDbKeyValue");

const tweetsCountToRetrieve = 40;

export { dynamoDbTableName, dynamoDbKeyName, dynamoDbKeyValue, tweetsCountToRetrieve };
