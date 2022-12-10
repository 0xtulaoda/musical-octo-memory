import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TwitterDocument = Twitter & Document;

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
export class Twitter {
  @Prop()
  protected: boolean;

  @Prop()
  id: string;

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
  username: string;

  @Prop()
  remark: string;

  @Prop()
  monitorUserId: string;
}

export const TwitterSchema = SchemaFactory.createForClass(Twitter);
