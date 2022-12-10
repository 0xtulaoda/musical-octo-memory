import { Module, CacheModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './email.service';

@Module({
  providers: [TasksService, EmailService],

  imports: [ScheduleModule.forRoot(), HttpModule, CacheModule.register()],
})
export class EmailModule {}
