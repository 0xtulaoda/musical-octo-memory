import { Module, CacheModule } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TradeService } from './trade.service';
import { Token, TokenSchema } from './schemas/token.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    CacheModule.register(),
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  providers: [TasksService, TradeService],
})
export class TradeModule {}
