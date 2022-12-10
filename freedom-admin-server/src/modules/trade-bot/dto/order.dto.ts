export class Order {
  id: number;
  symbol: string;
  quote: string;
  chain: Chain;
  type: 'BUY' | 'SELL' | 'STOPSELL' | 'STOPBUY';
  price: number;
  amount: number;
  slippage?: 1;
  recurring?: boolean;
  force?: boolean;
  status: 'PENDING' | 'EXECUTING' | 'EXECUTED';
}

export enum Chain {
  'Ethereum' = 1,
  'Polygon' = 137,
  'BinanceSmartChain' = 56,
}
