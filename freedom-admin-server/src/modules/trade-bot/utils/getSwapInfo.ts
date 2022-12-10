// import Web3 from 'web3';
import _ from 'lodash';
import axios from 'axios';
import getWeb3 from 'src/common/utils/web3';
import { getBscScanURL } from '../lib/helpers';
import { parseSwap, sendMessage } from './parseSwap';
import dayjs from 'dayjs';
interface TransactionItem {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

const web3 = getWeb3();
const swapTopic =
  '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';

let currentHash = '';
//获取最新新增交易
export const monitorUnSyncLastAddressTokenSwap = async (
  monitorAccount: string,
): Promise<string> => {
  //获取原始数据
  const getRawData = await axios.get(
    `${getBscScanURL()}?module=account&action=txlist&address=${monitorAccount}&page=1&offset=10&startblock=0&endblock=999999999&sort=desc&apikey=WV4WFMKED7AWBKESCYJZXKWSM489SYMHR8`,
  );

  return new Promise((resolve, reject) => {
    const {
      data: { result },
    } = getRawData as any;
    if (Array.isArray(result) && result.length > 0) {
      // 过滤失败交易
      const transactionList = result.filter(
        (item) => item.isError !== '1',
      ) as TransactionItem[];
      // 最近一次成功交易
      const lastTransation = transactionList[0];
      if (currentHash === '') {
        currentHash = lastTransation.hash;
      }
      if (currentHash !== '' && currentHash !== lastTransation.hash) {
        // if (currentHash !== '') {
        web3.eth
          .getTransactionReceipt(lastTransation.hash)
          .then(async (receipt: any) => {
            if (!receipt) {
              reject('交易未完成');
              return;
            } else if (receipt.status === true) {
              currentHash = lastTransation.hash;
              const allSwapList = receipt.logs.filter((log: any) =>
                log.topics.includes(swapTopic),
              );
              if (allSwapList.length === 0) {
                reject('非swap');
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
              const outputToken =
                allTokenList[allTokenList.length - 1].outputToken;

              const str = `---交易通知----------------
              监控分组名：健身哥
              交易hash: ${receipt.transactionHash}

              交易卖出通知
              钱包地址：${monitorAccount}
              钱包里交易卖出:【${inputToken.symbol}】
              数量：【${inputToken.amount}】
              查看行情
              
              交易买入通知
              钱包地址：${monitorAccount}
              钱包里交易买入:【${outputToken.symbol}】
              数量：【${outputToken.amount}】
              交易时间：${dayjs(+lastTransation.timeStamp * 1000).format(
                'YYYY-MM-DD HH:mm:ss',
              )}
              通知时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}
              相差：${dayjs().unix() - Number(lastTransation.timeStamp)} 秒
            `;
              // sendMessage(receipt, inputToken, outputToken, monitorAccount);
              resolve(str);
            }
          });
      }
    }
  });
};
