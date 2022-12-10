import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, Interval } from '@nestjs/schedule';
import { sleep } from '@src/common/utils/common';
import { sendMessage } from '@src/common/utils/telegram';
import { Model } from 'mongoose';
import { EmailService } from '../email/email.service';
import { CreateTwitterDto } from './dto/create-twitter.dto';
import { FollowerService } from './follower.service';
import { Twitter, TwitterDocument } from './schemas/twitter.schema';
import { HttpService } from '@nestjs/axios';
const isProd = process.env.NODE_ENV === 'production';
// import { UserService } from '../../user/user.service'
import { SysUserService } from '@src/modules/admin/system/user/user.service';
import { differenceBy } from 'lodash';
import { TwitterService } from 'nestjs-twitter-lite';
import { Follower } from './schemas/follower.schema';
import { lastValueFrom } from 'rxjs';
import dayjs from 'dayjs';

interface TodayFollowerList {
  currentTwitter: Twitter;
  todayFollowerList: Follower[];
}

export interface WechatBotParams {
  roomId: string;
  content: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    @InjectModel(Twitter.name)
    private readonly twitterModel: Model<TwitterDocument>,
    private readonly followerService: FollowerService,
    private userService: SysUserService,
    private emailService: EmailService,
    private readonly twitterService: TwitterService,
    private readonly httpService: HttpService,
  ) {}

  @Cron(isProd ? '0 0/15 * * * *' : '0 1 * * * *')
  // @Interval(1000 * 60 * 3)
  handleCron() {
    try {
      this.logger.log('开始同步推特关注');
      this.handleSyncTwitterFollower();
    } catch (error) {
      console.log(`error`, error);
    }
  }

  // 微信发送消息
  async wechatBotSendMessage(param: WechatBotParams) {
    this.logger.log('开始发微信消息');
    try {
      const postMessage = this.httpService.post(
        'http://106.14.65.141:3000/api/sendToRoom',
        {
          roomId: param.roomId,
          content: param.content,
        },
      );
      return await lastValueFrom(postMessage);
    } catch (e) {
      this.logger.log(e);
    }
  }

  // @Cron('0 0 */6 * * *')
  // @Interval(1000 * 30)
  async getReporter() {
    const allTwitter = (await this.twitterModel
      .find()
      .lean()) as Array<CreateTwitterDto>;
    const allUserList = allTwitter.map((item: CreateTwitterDto) => item.name);
    this.logger.log(`allTwitter:${allUserList}`);
    const allNewFollowers = [];
    for (let i = 0; i < allTwitter.length; i++) {
      const currentTwitter = allTwitter[i];
      const { id, monitorUserId, name, username } = currentTwitter;
      const today = new Date(dayjs(new Date()).format('YYYY-MM-DD'));

      // const nextDay = new Date(
      //   dayjs(new Date()).add(1, 'days').format('YYYY-MM-DD'),
      // );

      // 当日新增关注：
      const todayFollowerListResult =
        await this.followerService.findTwitterFollowerList({
          pageSize: 10,
          page: 1,
          followerOwnerId: id,
          syncDate: {
            $gte: today,
            // $lt: nextDay,
          },
          isInit: false,
        });
      const newFollower = {
        currentTwitter,
        todayFollowerList: todayFollowerListResult.list,
      };
      if (todayFollowerListResult.list.length > 0) {
        allNewFollowers.push(newFollower);
      }
    }

    const finalStr = allNewFollowers
      .map((item: TodayFollowerList) => {
        const { currentTwitter, todayFollowerList } = item;
        const { name, username } = currentTwitter;
        const newTwitterUser = todayFollowerList.map(
          (item: Follower) => `https://twitter.com/${item.username}`,
        );
        let { remark } = currentTwitter;
        if (!remark) {
          remark = username;
        }
        const str = `${remark}(@${name}) 新增关注：\n\n ${newTwitterUser.join(
          '\n',
        )}`;
        return str;
      })
      .join('\n\n\n');
    this.logger.log(`finalStr:${finalStr}`);
    if (finalStr) {
      this.emailService.sendEmailToSomeOther({
        from: '2513691817@qq.com', // 要发送邮件的邮箱
        to: 'coderaxin@gmail.com', // 接收信息的邮箱
        subject: `【推特监控】今日报告 ${dayjs(new Date()).format(
          'YYYY-MM-DD HH',
        )}`,
        // html: '<b>welcome !</b>',
        template: finalStr,
      });
    }
  }

  async handleSyncTwitterFollower() {
    const allTwitter = (await this.twitterModel
      .find()
      .lean()) as Array<CreateTwitterDto>;
    const allUserList = allTwitter.map((item: CreateTwitterDto) => item.name);
    this.logger.log(`allTwitter:${allUserList}`);
    for (let i = 0; i < allTwitter.length; i++) {
      const currentTwitter = allTwitter[i];
      const { id, monitorUserId, name, username } = currentTwitter;
      let { remark } = currentTwitter;
      if (!remark) {
        remark = username;
      }
      const findAccount = await this.userService.getAccountInfo(monitorUserId);
      if (!findAccount) {
        this.logger.error(`无此用户id:【${monitorUserId}】`);
        continue;
      }
      this.logger.log(`当前用户id:【${monitorUserId}】`);

      const parameters = {
        max_results: 300,
        'user.fields':
          'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics',
      };
      const result = await this.twitterService
        .get(`users/${id}/following`, parameters)
        .catch((error) => {
          this.logger.error(`调用推特API出错: ${JSON.stringify(error)}`);
        });

      if (!result?.data) {
        this.logger.log(`拉取【${remark}(@${name})】关注失败`);
        continue;
      }
      // 最新1000条记录
      let lastOwnerFollowerList = result.data.map((item: Follower) => ({
        followerOwnerId: id,
        syncDate: new Date(),
        isInit: false,
        ...item,
      }));

      this.logger.log(`同步：【${remark}(@${name})】成功`);
      const oldFollowerList =
        await this.followerService.findTwitterFollowerList({
          pageSize: 300,
          page: 1,
          followerOwnerId: id,
        });
      // 判断是否为init 当前follow
      if (oldFollowerList.total === 0) {
        // 首次init
        this.logger.log(`首次初始化：【${remark}(@${name})】`);
        lastOwnerFollowerList = lastOwnerFollowerList.map((item: Follower) => ({
          ...item,
          isInit: true,
        }));
        await this.followerService
          .batchAdd(lastOwnerFollowerList)
          .catch((error) => {
            this.logger.error(
              `followerService.batchAdd 出错: ${JSON.stringify(error)}`,
            );
          });
      } else {
        const differenceList = differenceBy(
          lastOwnerFollowerList,
          oldFollowerList.list,
          'id',
        );
        if (differenceList.length > 0) {
          this.logger.log(
            `新增关注【${remark}(@${name})】${differenceList.map(
              (d: any) => d.username,
            )}`,
          );

          // 删除之前的;
          await this.followerService
            .deleteMany({ followerOwnerId: id })
            .catch((error) => {
              this.logger.error(
                `followerService.deleteMany 出错当前用户id:${JSON.stringify(
                  error,
                )}`,
              );
            });
          //同步最新
          await this.followerService
            .batchAdd(lastOwnerFollowerList as unknown as Follower[])
            .catch((error) => {
              this.logger.error(
                `followerService.batchAdd 出错当前用户id:${JSON.stringify(
                  error,
                )}`,
              );
            });

          //添加最新关注到库
          await this.followerService
            .batchAddNewFollowerModel(differenceList as unknown as Follower[])
            .catch((error) => {
              this.logger.error(
                `followerService.batchAddNewFollowerModel 出错当前用户id:${JSON.stringify(
                  error,
                )}`,
              );
            });

          differenceList.map((item: any, index: number) => {
            const {
              public_metrics: { followers_count, following_count, tweet_count },
              created_at,
            } = item;

            const str = `${remark}(@${name})
新增关注: https://twitter.com/${item.username}
推文数: ${tweet_count}
关注数: ${following_count}
粉丝: ${followers_count}
注册日期: ${dayjs(created_at).format('YYYY-MM-DD')}`;
            // this.emailService.sendEmailToSomeOther({
            //   from: '2513691817@qq.com', // 要发送邮件的邮箱
            //   to: 'coderaxin@gmail.com', // 接收信息的邮箱
            //   subject: `【推特监控】${remark}(@${name}) `,
            //   // html: '<b>welcome !</b>',
            //   template: str,
            // });
            setTimeout(() => {
              sendMessage(str);
              this.wechatBotSendMessage({
                roomId: '韭盒监控禁言群',
                content: str,
              });
            }, 1000 * index);
          });
        } else {
          this.logger.log(`无新增【${remark}(@${name})】`);
        }
      }
      await sleep(1000 * 6);
    }
  }
}
