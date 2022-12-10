export class CreateTwitterDto {
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
  monitorUserId: number;
}

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

export interface CreateTwitter {
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
  monitorUserId: string;
}

export class CreateFollowerDto {
  followerOwnerId: string;
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  description: string;
  url: string;
  entities: any[];
  protected: boolean;
  followers_count: number;
  friends_count: number;
  listed_count: number;
  created_at: string;
  favourites_count: number;
  utc_offset?: any;
  time_zone?: any;
  geo_enabled: boolean;
  verified: boolean;
  statuses_count: number;
  lang?: any;
  contributors_enabled: boolean;
  is_translator: boolean;
  is_translation_enabled: boolean;
  profile_background_color: string;
  profile_background_image_url?: any;
  profile_background_image_url_https?: any;
  profile_background_tile: boolean;
  profile_image_url: string;
  profile_image_url_https: string;
  profile_banner_url: string;
  profile_link_color: string;
  profile_sidebar_border_color: string;
  profile_sidebar_fill_color: string;
  profile_text_color: string;
  profile_use_background_image: boolean;
  has_extended_profile: boolean;
  default_profile: boolean;
  default_profile_image: boolean;
  following: boolean;
  live_following: boolean;
  follow_request_sent: boolean;
  notifications: boolean;
  muting: boolean;
  blocking: boolean;
  blocked_by: boolean;
  translator_type: string;
  withheld_in_countries: any[];
}

export class PaginationOptionsDto {
  pageSize: number;
  page: number;
  followerOwnerId?: string;
  [key: string]: any;
}
