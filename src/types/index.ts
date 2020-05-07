/* eslint-disable @typescript-eslint/no-explicit-any */
import * as util from "./util";
import { AssertionError } from "assert";

/**
 * DynamoDBに格納されているはずのレコードの形
 */
export interface ConfigRecord {
  lastId?: string;
  screenNames: string[];
  keywords: string[];
  token: TokenType;
  s3: S3Type;
}

type S3Type = {
  bucket: string;
  key: string;
};

export function AssertsS3(arg: any): asserts arg is S3Type {
  util.mustBeObject(arg);
  util.mustBeString(arg, "bucket");
  util.mustBeString(arg, "key");
}

/**
 * Twitterトークン情報
 */
type TokenType = {
  consumer_key: string;
  consumer_secret: string;
  access_token: string;
  access_token_secret: string;
};

export function AssertsTokenType(arg: any): asserts arg is TokenType {
  util.mustBeObject(arg);
  util.mustBeString(arg, "consumer_key");
  util.mustBeString(arg, "consumer_secret");
  util.mustBeString(arg, "access_token");
  util.mustBeString(arg, "access_token_secret");
}

export function AssertsConfigRecord(arg: any): asserts arg is ConfigRecord {
  util.mustBeObject(arg);
  util.mustBeString(arg, "lastId", true);
  if (!Array.isArray(arg.keywords)) {
    throw new AssertionError({ message: "arg.keywords is not an Array", actual: arg.keywords });
  }
  if (arg.keywords.length === 0) {
    throw new AssertionError({ message: "arg.keywords is empty", actual: arg.keywords });
  }
  for (const item of arg.keywords) {
    if (typeof item !== "string") {
      throw new AssertionError({ message: "arg.keywords contains non-string value", actual: item });
    }
    try {
      new RegExp(item);
    } catch (e) {
      throw new AssertionError({ message: "arg.keywords contains malformed regular expression", actual: item });
    }
  }

  if (!Array.isArray(arg.screenNames)) {
    throw new AssertionError({ message: "arg.screenNames is not an Array", actual: arg.keywords });
  }
  if (arg.screenNames.length === 0) {
    throw new AssertionError({ message: "arg.screenNames is empty", actual: arg.keywords });
  }
  for (const item of arg.screenNames) {
    if (typeof item !== "string") {
      throw new AssertionError({ message: "arg.screenNames contains non-string value", actual: item });
    }
  }

  AssertsTokenType(arg.token);
  AssertsS3(arg.s3);
}

export interface Tweet {
  created_at: string;
  id: number;
  id_str: string;
  full_text: string;
  truncated: boolean;
  user: User;
  is_quote_status: boolean;
  in_reply_to_status_id?: number;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id?: number;
  in_reply_to_user_id_str?: string;
  in_reply_to_screen_name?: string;
}
export interface User {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  description: string;
  url: string;
  //entities: [Object],
  protected: boolean;
  followers_count: number;
  friends_count: number;
  listed_count: number;
}
