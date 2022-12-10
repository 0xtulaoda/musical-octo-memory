require('dotenv').config();
import JSONdb from 'simple-json-db';

import { TradeParam, Chain } from './models';
import { Api } from './api';
import { limitBuy, limitSell, stopSell, stopBuy } from './auto-trade';

const db = new JSONdb('trade-params.json');
const api = new Api();

const executeOrders = async () => {
  // const orders: TradeParam[] = (await db.get('orders')) || [];
  let lastChain = null;
  const orders: TradeParam[] = [];

  const tokens = await api.getAllTokenList(Chain.BinanceSmartChain);

  for (const order of orders) {
    if (!lastChain || order.chain !== lastChain) {
      lastChain = order.chain;
    }

    // 0 is pending, 1 is executed, 2 is repeating
    if (order.status === 'PENDING') {
      if (order.type === 'BUY') await limitBuy(api, db, tokens, order);
      if (order.type === 'SELL') await limitSell(api, db, tokens, order);
      if (order.type === 'STOPSELL') await stopSell(api, db, tokens, order);
      if (order.type === 'STOPBUY') await stopBuy(api, db, tokens, order);
    }
  }
};

const init = async () => {
  await executeOrders();
  setInterval(async () => await executeOrders());
};

init();
