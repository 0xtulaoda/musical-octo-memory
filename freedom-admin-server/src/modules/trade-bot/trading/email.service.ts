import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  sendEmail(template: string) {
    this.mailerService.sendMail({
      from: '2513691817@qq.com', // 要发送邮件的邮箱
      to: 'defi_sniper@groups.163.com', // 接收信息的邮箱
      subject: '【价格提醒】涨幅榜 Top20',
      // html: '<b>welcome !</b>',
      text: template,
    });
  }

  sendEmailToSomeOther(from: string, to: string, subject: string, template: string) {
    this.mailerService.sendMail({
      from, // 要发送邮件的邮箱
      to, // 接收信息的邮箱
      subject,
      // html: '<b>welcome !</b>',
      text: template,
    });
  }

  // async batchAdd(followList: Array<Order>): Promise<Order[]> {
  //   // @ts-ignore
  //   return this.followerModel.collection.insertMany(followList);
  // }
}
