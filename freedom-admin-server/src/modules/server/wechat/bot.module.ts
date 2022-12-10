import { Module } from '@nestjs/common';
import { WechatBotController } from './bot.controller';
import { WechatBotService } from './bot.service';

@Module({
  controllers: [WechatBotController],
  providers: [WechatBotService],
})
export class WechatBotModule {}
