import TelegramBot from 'node-telegram-bot-api';
const token = '5098999368:AAHTPF2vJXUwgvMzAQ1xyNYUgu8ZhYY6yuc';
import abi from '../lib/para-swap-abi';
import { getBscScanTxURL } from '../lib/helpers';
import {
  // isPancakeSwapV1Router,
  // getPancakeTokenURL,
  // getPancakeInputToken,
  getPoocoinTokenURL,
  // getWeb3Connection,
  // getWallets,
  // getBscScanURL,
  // getBscScanTxURL,
  // playSound,
} from '../lib/helpers';

const bot = new TelegramBot(token, { polling: true });

export const sendMessage = async (swap: any, inputToken: any, outputToken: any, from: any) => {
  const message = `【钱包交易详情】:\r${from}
  发送: ${inputToken.amount.toFixed(4)} [${inputToken.symbol} ](${getPoocoinTokenURL(
    inputToken.address,
  )})
  接收: ${outputToken.amount.toFixed(4)} [${outputToken.symbol} ](${getPoocoinTokenURL(
    outputToken.address,
  )})
  [Tx hash](${getBscScanTxURL(swap.transactionHash)})
  `;
  try {
    bot.sendMessage(-640230415, message, { parse_mode: 'Markdown' });
  } catch (e) {
    console.log(e);
  }
};

export const parseSwap = async (web3: any, swap: any, from: any) => {
  const pairContract = new web3.eth.Contract(abi.pair, swap.address);
  const amounts = web3.eth.abi.decodeParameters(
    ['uint256', 'uint256', 'uint256', 'uint256'],
    swap.data,
  );

  const [token0, token1] = await Promise.all([
    pairContract.methods
      .token0()
      .call()
      .catch((err: any) => console.log('Failed to fetch token0', err.data)),
    pairContract.methods
      .token1()
      .call()
      .catch((err: any) => console.log('Failed to fetch token1', err.data)),
  ]);

  const token0Contract = new web3.eth.Contract(abi.token, token0);
  const token1Contract = new web3.eth.Contract(abi.token, token1);

  const [symbol0, decimals0, symbol1, decimals1] = await Promise.all([
    token0Contract.methods
      .symbol()
      .call()
      .catch((err: any) => console.log('Failed to fetch token0', err.data)),
    token0Contract.methods
      .decimals()
      .call()
      .catch((err: any) => console.log('Failed to fetch token0', err.data)),
    token1Contract.methods
      .symbol()
      .call()
      .catch((err: any) => console.log('Failed to fetch token1', err.data)),
    token1Contract.methods
      .decimals()
      .call()
      .catch((err: any) => console.log('Failed to fetch token1', err.data)),
  ]);

  let inputToken, outputToken;
  if (amounts[0] != 0)
    inputToken = {
      address: token0,
      symbol: symbol0,
      amount: amounts[0] / Math.pow(10, decimals0),
    };
  else
    inputToken = {
      address: token1,
      symbol: symbol1,
      amount: amounts[1] / Math.pow(10, decimals1),
    };
  if (amounts[2] != 0)
    outputToken = {
      address: token0,
      symbol: symbol0,
      amount: amounts[2] / Math.pow(10, decimals0),
    };
  else
    outputToken = {
      address: token1,
      symbol: symbol1,
      amount: amounts[3] / Math.pow(10, decimals1),
    };
  return {
    // swap,
    inputToken,
    outputToken,
    from,
  };
  // sendMessage(swap, inputToken, outputToken, from);
};
