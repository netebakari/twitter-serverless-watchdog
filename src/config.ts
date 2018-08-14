const twitterToken = {
    consumer_key:        'xxxxxxxxxxxxxxxxxxxxxxxxx',
    consumer_secret:     'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    access_token:        '999999999999999999-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    access_token_secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}

const dynamoDb = {
    tableName: "YOUR-TABLE-NAME",
    keyName:   "TABLE-KEY-NAME",
    keyValue:  "KEY-NAME",
    region:    "ap-northeast-1"
}

const s3 = {
    bucket:  "YOUR-S3-BUCKET-NAME",
    keyName: "keywords.txt",
    region:  "ap-northeast-1"
}

const tweetsCountToRetrieve = 40;

export {
    twitterToken,
    dynamoDb,
    s3,
    tweetsCountToRetrieve
}