import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

export enum Chain {
  'Ethereum' = 1,
  'Polygon' = 137,
  'BinanceSmartChain' = 56,
}

@Schema({
  timestamps: true,
  id: true,
})
export class Order {
  @Prop()
  id: number;

  @Prop()
  symbol: string;

  @Prop()
  quote: string;

  @Prop()
  chain: Chain;

  @Prop()
  type: 'BUY' | 'SELL' | 'STOPSELL' | 'STOPBUY';

  @Prop()
  price: number;

  @Prop()
  amount: number;

  @Prop()
  slippage: 1;

  @Prop()
  recurring: boolean;

  @Prop()
  force: boolean;

  @Prop()
  status: 'PENDING' | 'EXECUTING' | 'EXECUTED';
}

export const OrderSchema = SchemaFactory.createForClass(Order);
