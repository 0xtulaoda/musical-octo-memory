import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TwitterModule } from 'nestjs-twitter-lite';
import { EmailService } from '../email/email.service';
import { TasksService } from './cron.service';
import { FollowerController } from './follower.controller';
import { FollowerService } from './follower.service';
import { Follower, FollowerSchema } from './schemas/follower.schema';
import { NewFollower, NewFollowerSchema } from './schemas/new-follower.schema';
import { Twitter, TwitterSchema } from './schemas/twitter.schema';
import { TwitterController } from './twitterScan.controller';
import { TwitterScanService } from './twitterScan.service';

import { SystemModule } from '@src/modules/admin/system/system.module';
import { TwitterOptions } from 'twitter-lite';
import { HttpModule } from '@nestjs/axios';

const consumer_key = 'FHYmd2bOK32HaRN73eed8hZVt';
const consumer_secret = 's3yUITb3oARoZHeBGO7HvSvzTLOjhAv8ClB7AKycyQpkZXSInn';
const access_token_key = '1541296529314459648-j4kotdtsYd7VIkULsg4QB6WL9HL5Zv';
const access_token_secret = 'nHVkZWkjWQoym89sE95upGcj6xEy8pL6sUz2tu50WZDMm';

const config: TwitterOptions = {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
  version: '2',
  extension: false, // true is the default (this must be set to false for v2 endpoints)
};

@Module({
  imports: [
    HttpModule,
    // forwardRef(() => UserModule), // 模块间循环依赖处理
    MongooseModule.forFeature([
      { name: Twitter.name, schema: TwitterSchema },
      { name: Follower.name, schema: FollowerSchema },
      { name: NewFollower.name, schema: NewFollowerSchema },
    ]),
    TwitterModule.forRoot(config),
    SystemModule,
  ],
  controllers: [TwitterController, FollowerController],
  providers: [TwitterScanService, FollowerService, TasksService, EmailService],
})
export class TwitterScanModule {}
