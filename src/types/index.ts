export declare interface ConfigRecordType {
  lastId: string;
  screenNames: string[];
  keywords: string[];
}

export declare interface Tweet {
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
export declare interface User {
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
