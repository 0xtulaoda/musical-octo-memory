import { Module, CacheModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [EmailService],

  imports: [ScheduleModule.forRoot(), HttpModule, CacheModule.register()],
})
export class EmailModule {}
