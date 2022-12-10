import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FollowerDocument = Follower & Document;

export class PublicMetrics {
  @Prop()
  followers_count: number;
  @Prop()
  following_count: number;
  @Prop()
  tweet_count: number;
  @Prop()
  listed_count: number;
}

@Schema({
  timestamps: true,
  id: true,
})
export class Follower {
  @Prop()
  id: number;

  @Prop()
  followerOwnerId: string;

  @Prop()
  protected: boolean;

  @Prop()
  profile_image_url: string;

  @Prop()
  description: string;

  @Prop()
  name: string;

  @Prop()
  public_metrics: PublicMetrics;

  @Prop()
  created_at: Date;

  @Prop()
  syncDate: Date;

  @Prop()
  username: string;

  @Prop()
  remark: string;

  @Prop()
  monitorUserId: string;

  //是否是初始化
  @Prop()
  isInit: boolean;
}

export const FollowerSchema = SchemaFactory.createForClass(Follower);
