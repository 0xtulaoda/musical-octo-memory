import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
// import Web3 from 'web3';
// import { ethers } from 'ethers';
import atob from 'atob';
// import { TradeService } from './trade.service';
// import { Observable } from 'rxjs';
import axios from 'axios';
import { baseCurrency, Chain, weiDecimals } from './models';
// import { Order, OrderDocument } from './schemas/order.schema';
import { Token } from './schemas/token.schema';
// import fs from 'fs';
import { TradeService } from './trade.service';
const baseUrl = `https://api.1inch.exchange/v3.0`;
// import open from 'open';
import {
  // isPancakeSwapV1Router,
  // getPancakeTokenURL,
  // getPancakeInputToken,
  // getPoocoinTokenURL,
  getWeb3Connection,
  getWallets,
  // getBscScanURL,
  // getBscScanTxURL,
  // playSound,
} from './lib/helpers';
import { parseSwap, sendMessage } from './utils/parseSwap';

import { monitorUnSyncLastAddressTokenSwap } from './utils/getSwapInfo';
const monitorAccount = '0x2d16e14d06937df9b0c862e6089380740757613e';

const swapTopic =
  '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';
// const transaction = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const wallets = getWallets();
const web3 = getWeb3Connection();
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { WechatBotParams } from '../monitor/twitter/cron.service';

// const shouldOpenPoocoin = /^true$/i.test((process.env.OPEN_POOCOIN || 'true').toLowerCase());
// const shouldOpenPancake = /^true$/i.test((process.env.OPEN_PANCAKE || 'true').toLowerCase());
// const shouldPlaySound = /^true$/i.test((process.env.PLAY_SOUND || 'true').toLowerCase());
console.log(`wallets`, wallets);
let timer_takeGain: any;
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly tradeService: TradeService,
    private readonly httpService: HttpService,
  ) {
    this.logger.debug('初始化成功');
    // this.monitorAccount();
  }

  // @Cron('45 * * * * *')
  handleCron() {
    this.logger.log('该方法将在45秒标记处每分钟运行一次');
  }

  // async initTelegram() {
  //   // replace the value below with the Telegram token you receive from @BotFather
  //   const token = '5098999368:AAHTPF2vJXUwgvMzAQ1xyNYUgu8ZhYY6yuc';

  //   // Create a bot that uses 'polling' to fetch new updates
  //   const bot = new TelegramBot(token, { polling: true });
  //   // Matches "/echo [whatever]"
  //   bot.onText(/\/echo (.+)/, (msg: any, match: any) => {
  //     // 'msg' is the received Message from Telegram
  //     // 'match' is the result of executing the regexp above on the text content
  //     // of the message
  //     const chatId = msg.chat.id;
  //     const resp = match[1]; // the captured "whatever"
  //     // send back the matched "whatever" to the chat
  //     bot.sendMessage(chatId, resp);
  //   });

  //   // Listen for any kind of message. There are different kinds of
  //   // messages.
  //   bot.on('message', (msg) => {
  //     const chatId = msg.chat.id;
  //     console.log(`chatId`, chatId);
  //     // send a message to the chat acknowledging receipt of their message
  //     bot.sendMessage(chatId, 'Received your message');
  //   });
  // }

  // @Interval(1000 * 6)
  async handleInterval() {
    const txHash =
      '0x0c1ec4ce04ab79468f167a986400e2584558e6d9f550792de715212b0b936797';
    web3.eth.getTransactionReceipt(txHash).then(async (receipt: any) => {
      if (!receipt) {
        this.logger.log(`${txHash} 交易ing`);
      } else if (receipt.status) {
        this.logger.log(`${txHash} 完成`);
        clearInterval(timer_takeGain);
        const allSwapList = receipt.logs.filter((log: any) =>
          log.topics.includes(swapTopic),
        );
        if (allSwapList.length === 0) {
          return;
        }
        const allTokenList = [];
        for (const swap of allSwapList) {
          const from = web3.utils.toChecksumAddress(
            '0x' + swap.topics[2].slice(26),
          ) as string;
          const result = await parseSwap(web3, swap, from);
          allTokenList.push(result);
        }
        const inputToken = allTokenList[0].inputToken;
        const outputToken = allTokenList[allTokenList.length - 1].outputToken;

        sendMessage(receipt, inputToken, outputToken, monitorAccount);
      } else {
        clearInterval(timer_takeGain);
        this.logger.log(`${txHash} 交易失败`);
      }
    });
  }

  async isContract(address: string) {
    const code = await web3.eth.getCode(address);
    if (code === '0x') {
      this.logger.log(`普通账户：${address} `);
      return false;
    } else {
      this.logger.log(`合约账户：${address} `);
      return true;
    }
  }

  @Interval(1000 * 1)
  async getLastMonitorAddressTransactions() {
    const result = await monitorUnSyncLastAddressTokenSwap(monitorAccount);
    this.wechatBotSendMessage({
      roomId: '交易监控',
      content: result,
    });
  }

  //同步交易对
  // @Interval(1000 * 30)
  async syncTransactionPair() {
    try {
      this.logger.log(`开始同步交易对`);
      const result = await this.syncTokenList();
      this.tradeService.batchAddTokenList(result);
      this.logger.log(`同步交易对成功：${result.length}条`);
    } catch (error) {
      this.logger.log(`同步交易对失败:${error}`);
    }
  }

  async syncTokenList() {
    try {
      const baseTokenList = await this.getBaseTokenList();
      const recentTokenList = await this.findRecentBaseToken();
      const allTokens = [...baseTokenList, ...recentTokenList];
      const balanceURL = `https://balances.1inch.exchange/v1.1/${Chain.BinanceSmartChain}/allowancesAndBalances/0x1111111254fb6c44bac0bed2854e76f90643097d/${process.env.PUBLIC_KEY}?tokensFetchType=customAndLpTokens`;
      const balances = (await axios.get(balanceURL)).data;
      const tokenPricesUrl = `https://token-prices.1inch.exchange/v1.1/${Chain.BinanceSmartChain}`;
      const response = (await axios.get(tokenPricesUrl)).data;
      const tokenPrices = response.message
        ? new Error(response.message)
        : response;

      const usdcPrice = +tokenPrices[baseCurrency.address] / weiDecimals;

      for (const token of allTokens) {
        token.price =
          (+tokenPrices[token.address] / weiDecimals) * (1 / usdcPrice);
        token.balance = +balances[token.address]?.balance
          ? +balances[token.address].balance / Math.pow(10, +token.decimals)
          : 0;
        token.allowance = +balances[token.address]?.allowance
          ? +balances[token.address]?.allowance / Math.pow(10, +token.decimals)
          : 0;
      }
      this.logger.log(`整合获取基础信息成功:${allTokens.length}条`);
      return allTokens;
    } catch (error) {
      this.logger.error(`整合获取基础信息代币失败:${error}`);
      return [];
    }
  }

  // 微信发送消息
  async wechatBotSendMessage(param: WechatBotParams) {
    this.logger.log('开始发微信消息');
    try {
      const postMessage = this.httpService.post(
        'http://106.14.65.141:3000/api/sendToRoom',
        {
          roomId: param.roomId,
          content: param.content,
        },
      );
      return await lastValueFrom(postMessage);
    } catch (e) {
      this.logger.log(e);
    }
  }

  //从1inch获取基础代币
  async getBaseTokenList(
    chain: Chain | string = Chain.BinanceSmartChain,
  ): Promise<Token[]> {
    try {
      this.logger.log(`开始从1inch获取基础代币`);
      const listUrl = `${baseUrl}/${chain}/tokens`;
      const tokenObject = (await axios.get(listUrl)).data.tokens;

      const tokens: Token[] = Object.keys(tokenObject).map((t: string) => ({
        pair: `${tokenObject[t].symbol}${baseCurrency.name}`,
        ...tokenObject[t],
      }));
      this.logger.log(`从avedex获取筛选代币成功:${tokens.length}条`);
      return tokens;
    } catch (error) {
      this.logger.error(`从1inch获取基础代币失败:${error}`);
      return [];
    }
  }

  // 从avedex获取筛选代币
  async findRecentBaseToken() {
    try {
      this.logger.log(`开始从avedex获取筛选代币`);
      const getDataUrl = `https://avedex.cc/v1api/v1/pairs?pageNO=1&pageSize=100000&sort=created_at&direction=desc&chain=bsc&minPoolSize=100000`;
      const lastTokenList = await axios.get(getDataUrl, {
        headers: {
          Authorization:
            'ea88c22fdf68db4dac1ac605e7c798ac2be6e94f1636878458449',
        },
      });
      if (lastTokenList.data && lastTokenList.data.status === 1) {
        const result = JSON.parse(
          decodeURIComponent(
            atob(lastTokenList.data.encode_data).replace(/\+/g, ' '),
          ),
        ).data;
        const tokens = result.map((element: any) => {
          if (
            element.token0_symbol === 'BNB' ||
            element.token0_symbol === 'WBNB' ||
            element.token0_symbol === 'BUSD' ||
            element.token0_symbol === 'USDT'
          ) {
            return {
              price: element.token1_price_usd,
              symbol: element.token1_symbol,
              address: element.target_token,
              decimals: element.token1_decimals,
              balance: 0,
              ...element,
            };
          } else {
            return {
              price: element.token0_price_usd,
              symbol: element.token0_symbol,
              address: element.target_token,
              decimals: element.token0_decimals,
              balance: 0,
              ...element,
            };
          }
        });
        this.logger.log(`从avedex获取筛选代币成功:${tokens.length}条`);
        return tokens;
      }
    } catch (error) {
      this.logger.error(`从avedex获取筛选代币失败:${error}`);
    }
    return [];
  }
}
