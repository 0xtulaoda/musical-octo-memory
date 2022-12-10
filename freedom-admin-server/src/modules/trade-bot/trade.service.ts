import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Token, TokenDocument } from './schemas/token.schema';
import { Model } from 'mongoose';
@Injectable()
export class TradeService {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>,
    private readonly mailerService: MailerService,
  ) {}

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

  //批量添加token
  async batchAddTokenList(tokenList: Array<Token>): Promise<string> {
    this.tokenModel.collection.deleteMany({});
    return this.tokenModel.collection
      .insertMany(tokenList)
      .then(() => {
        return '同步token完成';
      })
      .catch((e: HttpException) => {
        throw new HttpException(e, HttpStatus.OK);
      });
  }
}
