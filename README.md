# twitter-serverless-watchdog
特定の人のTwitterアカウント（複数指定可能）を見守り、予め指定しておいたキーワードを含むツイートが見つかったらツイート＋引用RTでお知らせするBOT

# 動作環境
AWS Lambda (Node.js v12.x) + DynamoDB + S3 + CloudWatch Events

# 事前準備
## Twitterアカウント＆トークンを準備
開発者として登録し、Twitterアプリケーションの登録を行って各種トークンを取得する。人は誰かに監視されていることに気付くと特別な気持ちになりがちなのでもちろん鍵がかかっているアカウントで認証を行った方が良い。

## DynamoDB
DynamoDBに適当なテーブルを作り（キーは1個だけで一意に特定できる必要がある）、次のような形のレコードを入れる。

```json
{
  "tablekey": "twitter-serverless-watchdog",
  "keywords": ["ガソリン", "ナイフ", "カッター"],
  "screenNames": ["twitter", "abunai_hito", "kikenna_hito"],
  "token": {
    "consumer_key": "xxxxxxxxxxxxxxxxxxxxxxxxx",
    "consumer_secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "access_token": "999999999999999999-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "access_token_secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

* `tableKey` はテーブルのキーの名前。適当に設定する。 `watchdog` も好きな名前に変えて良い。
  * この両者は後で環境変数で指定する
* `keywords` には監視するキーワードを入れる。 正規表現。 `[` や `.` はエスケープする必要があるので気をつけること。
* `screenNames` には監視対象アカウントのスクリーンネームを書く。

## S3バケットを準備
このBOTが監視対象のツイートを検知すると次のようなツイートが送信される。

```
1000000000000000000以降のチェックを行い、N件の監視対象ツイートが見つかりました。 @null宛で引用RTします。
現在の監視アカウント: @kiken_na_hito, @abunai_hito
現在の監視キーワード: https://ap-northeast-1.amazonaws.com/YOUR-BUCKET-NAME/keywords.txt
```

この「現在の監視キーワード」一覧はS3に置いたテキストファイルに出力するので（監視ワードが長すぎて1ツイートに入らなくなると困るため）、このためのS3バケットを作成し、Static website hostingを有効にしておく。

## IAMロールを作成
LambdaのためにDynamoDBとS3にアクセスできるロールを作成する。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:ap-northeast-1:999999999999:table/YOUR-TABLE-NAME"
    },
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Lambda関数登録・環境変数登録
`twitter-serverless-watchdog.zip` をアップロードしてLambda関数をデプロイし、環境変数を設定する。

| 環境変数名            | 意味                                        |
|----------------------|---------------------------------------------|
| region               | DynamoDB, S3のリージョン                    |
| dynamoDbTableName    | DynamoDBのテーブル名                        |
| dynamoDbKeyName      | DynamoDBのキー                             |
| dynamoDbKeyValue     | DynamoDBのキーの値                          |
| s3BucketName         | 検索キーワードが記入されるS3バケット名       |
| s3KeywordKeyName     | 検索キーワードが記入されるS3オブジェクト名    |

## 定期実行設定
CloudWatch Eventsで定期的に実行するように設定して終わり。

# 動作検証
```
$ npm install
$ npx tsc
```
でビルドし、
```
$ npm run test-tweet
```
でテストツイートだけを行う（@null宛のメンションになる）。
```
$ npm start
```
で実際の処理を一通り行う。

# デプロイ
動作検証で問題がなければ、
```
$ ./build.sh
```
で `twitter-serverless-watchdog.zip` が生成される。これをアップロードしてLambdaを作成。あとはCloudWatch Eventsで定期実行するだけ。
