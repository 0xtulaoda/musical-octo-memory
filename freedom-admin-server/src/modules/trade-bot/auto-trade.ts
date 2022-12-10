import { TradeParam } from './models';
import { Api, wallet } from './api';
import { get1inchPrice } from './utils/inchPrice';

export const explorerURL = 'https://bscscan.com/';

const updateStatus = async (db: any, order: TradeParam, status: string) => {
  const orders: TradeParam[] = await db.get('orders');
  const filteredOrders = orders.filter((o) => o.id !== order.id);
  await db.set('orders', [...filteredOrders, { ...order, status: status }]);
};

export const limitBuy = async (
  api: Api,
  db: any,
  tokens: any,
  order: TradeParam,
) => {
  const tradeToken = tokens.find((t: any) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t: any) => t.symbol === order.quote);
  if (tradeToken && quoteToken) {
    const currentPrice = await get1inchPrice(
      tradeToken.address,
      quoteToken.address,
      '1000000000000000000',
    );
    const globalData = await api.approveApiCaller(quoteToken.address);
    console.log(globalData);
    try {
      await wallet.sendTransaction(globalData).then((data) => {
        const txURL = `${explorerURL}/tx/${data.hash}`;
        console.log('congrats! your transaction is here', txURL);
      });
      console.log('Approval success');
    } catch (e) {
      console.log(e.message);
      console.log('Approval failure');
    }
    console.log(`currentPrice`, currentPrice);
    const tradeAmount = +(order.amount * currentPrice).toFixed(
      quoteToken.decimals,
    );

    if (tradeAmount > quoteToken.balance) {
      console.log(
        `BUY ${order.amount} ${tradeToken.symbol} for ${tradeAmount} ${quoteToken.symbol} - not enough balance - balance: ${quoteToken.balance}`,
      );
    } else {
      console.log(
        `BUY ${order.amount} ${tradeToken.symbol} for ${tradeAmount} ${quoteToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is below ${order.price} - last price: ${currentPrice}`,
      );
      if (currentPrice <= order.price) {
        updateStatus(db, order, 'EXECUTING');
        const scannerUrl = await api.swap(
          quoteToken,
          tradeToken,
          tradeAmount,
          order.force,
          order.slippage,
          order.chain,
        );
        if (scannerUrl) {
          if (order.recurring) {
            updateStatus(db, order, 'PENDING');
          } else {
            updateStatus(db, order, 'EXECUTED');
            const globalData = await api.approveApiCaller(tradeToken.address);
            console.log(globalData);
            try {
              await wallet.sendTransaction(globalData).then((data) => {
                const txURL = `${explorerURL}/tx/${data.hash}`;
                console.log('congrats! your transaction is here', txURL);
              });
              console.log('Approval success');
            } catch (e) {
              console.log(e.message);
              console.log('Approval failure');
            }
          }
        } else {
          updateStatus(db, order, 'PENDING');
        }
      }
    }
  } else {
    console.log(`API busy`);
  }
};

export const stopBuy = async (
  api: Api,
  db: any,
  tokens: any,
  order: TradeParam,
) => {
  const tradeToken = tokens.find((t: any) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t: any) => t.symbol === order.quote);

  if (tradeToken && quoteToken) {
    const currentPrice = await get1inchPrice(
      tradeToken.address,
      quoteToken.address,
      '1000000000000000000',
    );
    const tradeAmount = +(order.amount * currentPrice).toFixed(
      quoteToken.decimals,
    );

    if (tradeAmount > quoteToken.balance) {
      console.log(
        `BUY ${order.amount} ${tradeToken.symbol} for ${tradeAmount} ${quoteToken.symbol} - not enough balance - balance: ${quoteToken.balance}`,
      );
    } else {
      console.log(
        `BUY ${order.amount} ${tradeToken.symbol} for ${tradeAmount} ${quoteToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is above ${order.price} - last price: ${currentPrice}`,
      );
      if (currentPrice >= order.price) {
        updateStatus(db, order, 'EXECUTING');
        const scannerUrl = await api.swap(
          quoteToken,
          tradeToken,
          tradeAmount,
          order.force,
          order.slippage,
          order.chain,
        );
        if (scannerUrl) {
          if (order.recurring) {
            updateStatus(db, order, 'PENDING');
          } else {
            updateStatus(db, order, 'EXECUTED');
          }
        } else {
          updateStatus(db, order, 'PENDING');
        }
      }
    }
  } else {
    console.log(`API busy`);
  }
};

export const limitSell = async (
  api: Api,
  db: any,
  tokens: any,
  order: TradeParam,
) => {
  const tradeToken = tokens.find((t: any) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t: any) => t.symbol === order.quote);
  if (tradeToken && quoteToken) {
    const currentPrice = await get1inchPrice(
      tradeToken.address,
      quoteToken.address,
      '1000000000000000000',
    );
    const tradeAmount = +(order.amount * order.price).toFixed(
      tradeToken.decimals,
    );
    const globalData = await api.approveApiCaller(tradeToken.address);
    console.log(globalData);
    try {
      await wallet.sendTransaction(globalData).then((data) => {
        const txURL = `${explorerURL}/tx/${data.hash}`;
        console.log('congrats! your transaction is here', txURL);
      });
      console.log('Approval success');
    } catch (e) {
      console.log(e.message);
      console.log('Approval failure');
    }

    if (order.amount > tradeToken.balance) {
      console.log(
        `SELL ${order.amount} ${tradeToken.symbol} for ${tradeAmount} ${quoteToken.symbol} - not enough balance - balance: ${tradeToken.balance}`,
      );
    } else {
      console.log(
        `SELL ${order.amount} ${tradeToken.symbol} for ${tradeAmount} ${quoteToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is above ${order.price} - last price: ${currentPrice}`,
      );

      if (currentPrice >= order.price) {
        updateStatus(db, order, 'EXECUTING');
        const scannerUrl = await api.swap(
          tradeToken,
          quoteToken,
          order.amount,
          order.force,
          order.slippage,
          order.chain,
        );
        if (scannerUrl) {
          if (order.recurring) {
            updateStatus(db, order, 'PENDING');
          } else {
            updateStatus(db, order, 'EXECUTED');
          }
        } else {
          updateStatus(db, order, 'PENDING');
        }
      }
    }
  } else {
    console.log(`API busy`);
  }
};

export const stopSell = async (
  api: Api,
  db: any,
  tokens: any,
  order: TradeParam,
) => {
  const tradeToken = tokens.find((t: any) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t: any) => t.symbol === order.quote);
  if (tradeToken && quoteToken) {
    const currentPrice = tradeToken.price / quoteToken.price;
    const tradeAmount = +(order.amount * order.price).toFixed(
      tradeToken.decimals,
    );

    if (order.amount > tradeToken.balance) {
      console.log(
        `SELL ${order.amount} ${tradeToken.symbol} for ${tradeAmount} ${quoteToken.symbol} - not enough balance - balance: ${tradeToken.balance}`,
      );
    } else {
      console.log(
        `SELL ${order.amount} ${tradeToken.symbol} for ${tradeAmount} ${quoteToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is below ${order.price} - last price: ${currentPrice}`,
      );
      if (currentPrice <= order.price) {
        updateStatus(db, order, 'EXECUTING');
        const scannerUrl = await api.swap(
          tradeToken,
          quoteToken,
          order.amount,
          order.force,
          order.slippage,
          order.chain,
        );
        if (scannerUrl) {
          if (order.recurring) {
            updateStatus(db, order, 'PENDING');
          } else {
            updateStatus(db, order, 'EXECUTED');
          }
        } else {
          updateStatus(db, order, 'PENDING');
        }
      }
    }
  } else {
    console.log(`API busy`);
  }
};
