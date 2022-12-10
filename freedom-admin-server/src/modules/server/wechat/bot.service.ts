import { Injectable, Logger } from '@nestjs/common';
import { Message, ScanStatus, WechatyBuilder } from 'wechaty';
import { PuppetPadlocal } from 'wechaty-puppet-padlocal';
import qrcodeterminal from 'qrcode-terminal';
import { dingDongBot, getMessagePayload, LOGPRE } from './helper';

import { CreateMessageDto } from './bot.controller';

@Injectable()
export class WechatBotService {
  private readonly logger = new Logger(WechatBotService.name);
  bot: any;
  constructor() {
    this.initBot();
  }

  async initBot() {
    const puppet = new PuppetPadlocal({
      token: 'puppet_padlocal_7cc6492e46834fc5a6a02435398f4bf1',
    });

    const name = '机器人小叮当';

    this.bot = await WechatyBuilder.build({
      name,
      puppet,
      // puppetOptions: {
      //   uos: true,
      // },
    })
      .on('scan', (qrcode, status) => {
        if (status === ScanStatus.Waiting && qrcode) {
          const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
          ].join('');

          this.logger.log(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);

          console.log(
            '\n==================================================================',
          );
          console.log('\n* Two ways to sign on with qr code');
          console.log('\n1. Scan following QR code:\n');

          qrcodeterminal.generate(qrcode, { small: true }); // show qrcode on console

          console.log(
            `\n2. Or open the link in your browser: ${qrcodeImageUrl}`,
          );
          console.log(
            '\n==================================================================\n',
          );
        } else {
          this.logger.log(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);
        }
      })

      .on('login', (user) => {
        this.logger.log(LOGPRE, `${user} login`);
      })

      .on('logout', (user, reason) => {
        this.logger.log(LOGPRE, `${user} logout, reason: ${reason}`);
      })

      .on('message', async (message) => {
        this.logger.log(LOGPRE, `on message: ${message.toString()}`);

        await getMessagePayload(message);

        await dingDongBot(message);
      })

      .on('room-invite', async (roomInvitation) => {
        this.logger.log(LOGPRE, `on room-invite: ${roomInvitation}`);
      })

      .on('room-join', (room, inviteeList, inviter, date) => {
        this.logger.log(
          LOGPRE,
          `on room-join, room:${room}, inviteeList:${inviteeList}, inviter:${inviter}, date:${date}`,
        );
      })

      .on('room-leave', (room, leaverList, remover, date) => {
        this.logger.log(
          LOGPRE,
          `on room-leave, room:${room}, leaverList:${leaverList}, remover:${remover}, date:${date}`,
        );
      })

      .on('room-topic', (room, newTopic, oldTopic, changer, date) => {
        this.logger.log(
          LOGPRE,
          `on room-topic, room:${room}, newTopic:${newTopic}, oldTopic:${oldTopic}, changer:${changer}, date:${date}`,
        );
      })

      .on('friendship', (friendship) => {
        this.logger.log(LOGPRE, `on friendship: ${friendship}`);
      })

      .on('error', (error) => {
        this.logger.error(LOGPRE, `on error: ${error}`);
      });

    this.bot.start().then(() => {
      this.logger.log(LOGPRE, 'started.');
    });
  }

  async sendMessage(params: CreateMessageDto) {
    const toRoom = await this.bot.Room.load(params.roomId);
    try {
      const message = (await toRoom.say(params.payload)) as Message;
      return message;
    } catch (err) {
      return null;
    }
  }
}
