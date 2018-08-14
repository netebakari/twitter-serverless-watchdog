const Twit = require("twit")
import * as Types from "./types"

export default class TwitterClient {
    readonly client: any;
    readonly dryRun: boolean;

    constructor(credentials, dryRun = false) {
        this.client = new Twit(credentials);
        this.dryRun = dryRun;
    }

    /**
     * ツイートをstatus urlに変換する
     * @param tweet 対象のツイート
     * @param mask trueが明示的に指定されたらスクリーンネームを"-"に置換する
     */
    static tweetToStatusUrl(tweet: Types.Tweet, mask: boolean = false) {
        const screenName = mask ? "-" : tweet.user.screen_name;
        return `https://twitter.com/${screenName}/status/${tweet.id_str}`;
    }
    
    /**
     * 対象のユーザーから直近のツイートを取得する
     * @param screenName ユーザー
     * @param count 最大取得件数（最大値は3200）
     * @param sinceId status id. これよりも後のものだけが返される
     */
    async getRecentTweets(screenName: string, count: number, sinceId: string|null = null): Promise<Types.Tweet[]> {
        console.log(`@${screenName}のツイートで${sinceId}以降のものを最大${count}件取得します`)
        const params: any = {
            screen_name: screenName,
            count: count,
            include_rts: false,
            exclude_replies: false,
            tweet_mode: "extended"
        };
        if (sinceId) { params.since_id = sinceId; }

        return new Promise((resolve, reject) => {
            this.client.get('statuses/user_timeline', params, function(error: any, tweets: Types.Tweet[], response: any) {
                if (!error) {
                    console.log(`...${tweets.length}件取得しました`);
                    resolve(tweets);
                } else {
                    reject(null);
                }
            });
        }) as Promise<Types.Tweet[]>;
    }
    
    /**
     * ツイートを送信する。インスタンス生成時に dryRun = true を指定していたら console.log で出力するだけ
     * @param text 
     */
    async sendTweet(text: string) {
        if (this.dryRun) {
            console.log(`ツイート送信はスキップします: ${text}`);
            return null;
        } else {
            console.log(`ツイートを送信します: ${text}`);
            return this.client.post('statuses/update', {status: text});
        }
    }
}