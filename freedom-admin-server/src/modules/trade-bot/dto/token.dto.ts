export class Token {
  price?: any;
  symbol: string;
  address: string;
  balance: number;
  pair: string;
  chain: string;
  amm: string;
  token0_address: string;
  token0_symbol: string;
  token0_decimal: number;
  token1_address: string;
  token1_symbol: string;
  token1_decimal: number;
  target_token: string;
  reserve0: number;
  reserve1: number;
  token0_price_eth: number;
  token0_price_usd: number;
  token1_price_eth: number;
  token1_price_usd: number;
  price_change: number;
  reserve_change: number;
  created_at: number;
  allowance: number;
}

export enum Chain {
  'Ethereum' = 1,
  'Polygon' = 137,
  'BinanceSmartChain' = 56,
}
