import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;
@Schema({
  timestamps: true,
  id: true,
})
export class Token {
  @Prop()
  id: number;

  @Prop()
  price: string;

  @Prop()
  symbol: string;

  @Prop()
  address: string;

  @Prop()
  balance: number;

  @Prop()
  pair: string;

  @Prop()
  chain: string;

  @Prop()
  amm: string;

  @Prop()
  token0_address: string;

  @Prop()
  token0_symbol: string;

  @Prop()
  token0_decimal: number;

  @Prop()
  token1_address: string;

  @Prop()
  token1_symbol: string;

  @Prop()
  token1_decimal: number;

  @Prop()
  target_token: string;

  @Prop()
  reserve0: number;

  @Prop()
  reserve1: number;

  @Prop()
  token0_price_eth: number;

  @Prop()
  token0_price_usd: number;

  @Prop()
  token1_price_eth: number;

  @Prop()
  token1_price_usd: number;

  @Prop()
  price_change: number;

  @Prop()
  reserve_change: number;

  @Prop()
  created_at: number;

  @Prop()
  allowance: number;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
