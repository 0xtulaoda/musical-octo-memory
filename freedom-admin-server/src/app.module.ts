import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import Configuration from './config/configuration';
import { MissionModule } from './mission/mission.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/monitor/email/email.module';
import { TwitterScanModule } from './modules/monitor/twitter/twitterScan.module';
import { WSModule } from './modules/ws/ws.module';
import './polyfill';
import { LoggerModule } from './shared/logger/logger.module';
import { SharedModule } from './shared/shared.module';
import { TradeModule } from './modules/trade-bot/trade.module';

import { LOGGER_MODULE_OPTIONS } from './shared/logger/logger.constants';
import {
  LoggerModuleOptions,
  WinstonLogLevel,
} from './shared/logger/logger.interface';
import { TypeORMLoggerService } from './shared/logger/typeorm-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      useFactory: (
        configService: ConfigService,
        loggerOptions: LoggerModuleOptions,
      ) => ({
        autoLoadEntities: true,
        type: configService.get<any>('database.type'),
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get('database.logging'),
        timezone: configService.get('database.timezone'), // 时区
        multipleStatements: true,
        dropSchema: false,
        supportBigNumbers: true,
        bigNumberStrings: true,
        // 自定义日志
        logger: new TypeORMLoggerService(
          configService.get('database.logging'),
          loggerOptions,
        ),
      }),
      inject: [ConfigService, LOGGER_MODULE_OPTIONS],
    }),
    BullModule.forRoot({}),
    // custom logger
    LoggerModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return {
            level: configService.get<WinstonLogLevel>('logger.level'),
            consoleLevel: configService.get<WinstonLogLevel>(
              'logger.consoleLevel',
            ),
            timestamp: configService.get<boolean>('logger.timestamp'),
            maxFiles: configService.get<string>('logger.maxFiles'),
            maxFileSize: configService.get<string>('logger.maxFileSize'),
            disableConsoleAtProd: configService.get<boolean>(
              'logger.disableConsoleAtProd',
            ),
            dir: configService.get<string>('logger.dir'),
            errorLogName: configService.get<string>('logger.errorLogName'),
            appLogName: configService.get<string>('logger.appLogName'),
          };
        },
        inject: [ConfigService],
      },
      // global module
      true,
    ),
    // custom module
    SharedModule,
    // mission module
    MissionModule.forRoot(),
    // application modules import
    AdminModule,
    // websocket module
    WSModule,
    EmailModule,
    // 业务功能模块
    TwitterScanModule,
    TradeModule,
    // mongodb的连接
    MongooseModule.forRoot(
      'mongodb://token_sniper:2DPQ0b9oByq6KfGW@8.218.4.112:27017/token_sniper?retryWrites=true&w=majority',
    ),
    //邮箱配置
    MailerModule.forRootAsync({
      useFactory: () => ({
        // transport: 'smtps://coderaxin@163.com:XIWXXNNWWMQSGKSD@smtp.163.com',
        transport: 'smtps://2513691817@qq.com:cawxontbydvqechc@smtp.qq.com',
        defaults: {
          from: '"domain.com" <no-reply@domain.com>',
        },
        // template: {
        //   // dir: process.cwd() + '/src/template/', // 这一句不用配置，可以找到路径
        //   dir: path.join(__dirname, './template'),
        //   adapter: new PugAdapter(),
        //   options: {
        //     strict: true,
        //   },
        // },
      }),
    }),
  ],
})
export class AppModule {}
