export interface Url2 {
  start: number;
  end: number;
  url: string;
  expanded_url: string;
  display_url: string;
}

export interface Url {
  urls: Url2[];
}

export interface Entities {
  url: Url;
}

export interface PublicMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
}

export interface TwitterUser {
  followerOwnerId?: any;
  protected: boolean;
  id: string;
  _id: string;
  profile_image_url: string;
  description: string;
  entities: Entities;
  name: string;
  public_metrics: PublicMetrics;
  created_at: Date;
  username: string;
  remark: string;
}
