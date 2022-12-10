import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { WechatBotService } from './bot.service';

export class CreateMessageDto {
  @ApiProperty({ description: '群ID' })
  @IsString()
  roomId: string;

  @ApiProperty({ description: '消息文本' })
  @IsString()
  payload: string;
}

@ApiTags('微信Bot-Twitter监控')
@Controller('bot')
export class WechatBotController {
  constructor(private botService: WechatBotService) {}

  @Post('sendMessage')
  @ApiOperation({ summary: '发送消息' })
  async create(@Body() botDto: CreateMessageDto) {
    return await this.botService.sendMessage(botDto);
  }
}
