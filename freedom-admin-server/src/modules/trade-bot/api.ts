import { ethers } from 'ethers';
import fs from 'fs';
import atob from 'atob';
import { baseCurrency, Chain, Token } from './models';
import axios from 'axios';
// import { MaxUint256 } from '@ethersproject/constants';
// import * as erc20Abi from './abis/erc20.json';
// import * as BASE_TOKEN from './conf/basetoken.json';

const baseUrl = `https://api.1inch.exchange/v3.0`;
const BSCprovider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL); //rpc can be replaced with an ETH or BSC RPC
export const wallet = new ethers.Wallet(`0x${process.env.PRIVATE_KEY}`, BSCprovider); //connect the matic provider along with using the private key as a signer
const weiDecimals = 1000000000000000000;

export class Api {
  async getAllTokenList(chain: Chain | string = Chain.BinanceSmartChain) {
    const getDataUrl = `https://avedex.cc/v1api/v1/pairs?pageNO=1&pageSize=100000&sort=created_at&direction=desc&chain=bsc&minPoolSize=100000`;
    const tokenObject = (
      await axios.get(getDataUrl, {
        headers: {
          Authorization: '92a9534b321943414e83ef60ec1af5910cd3197e1641114690319',
        },
      })
    ).data;

    const baseToken = await this.getBaseTokenList(Chain.BinanceSmartChain);

    if (tokenObject.status === 1) {
      const result = JSON.parse(
        decodeURIComponent(atob(tokenObject.encode_data).replace(/\+/g, ' ')),
      ).data;
      let tokens = result.map((element: any) => {
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
      tokens = tokens.concat(baseToken);
      const balanceURL = `https://balances.1inch.exchange/v1.1/${chain}/allowancesAndBalances/0x1111111254fb6c44bac0bed2854e76f90643097d/${process.env.PUBLIC_KEY}?tokensFetchType=customAndLpTokens`;
      const balances = (await axios.get(balanceURL)).data;
      const tokenPricesUrl = `https://token-prices.1inch.exchange/v1.1/${chain}`;
      const response = (await axios.get(tokenPricesUrl)).data;
      const tokenPrices = response.message ? new Error(response.message) : response;

      const usdcPrice = +tokenPrices[baseCurrency.address] / weiDecimals;

      for (const token of tokens) {
        token.price = (+tokenPrices[token.address] / weiDecimals) * (1 / usdcPrice);
        token.balance = +balances[token.address]?.balance
          ? +balances[token.address].balance / Math.pow(10, +token.decimals)
          : 0;
        token.allowance = +balances[token.address]?.allowance
          ? +balances[token.address]?.allowance / Math.pow(10, +token.decimals)
          : 0;
      }
      fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));
      return tokens;
    }
    return [];
  }

  async getBaseTokenList(chain: Chain | string = Chain.BinanceSmartChain): Promise<Token[]> {
    try {
      const listUrl = `${baseUrl}/${chain}/tokens`;
      const tokenObject = (await axios.get(listUrl)).data.tokens;

      const tokens: Token[] = Object.keys(tokenObject).map((t: string) => ({
        pair: `${tokenObject[t].symbol}${baseCurrency.name}`,
        ...tokenObject[t],
      }));
      return tokens;
    } catch {
      return [];
    }
  }

  async swap(
    fromToken: Token,
    toToken: Token,
    amount: number,
    force = false,
    slippage = 1,
    chain: Chain | string = Chain.BinanceSmartChain,
  ): Promise<string> {
    try {
      const wei = amount * Math.pow(10, +fromToken.decimals);
      const url = `${baseUrl}/${chain}/swap?fromAddress=${process.env.PUBLIC_KEY}&fromTokenAddress=${fromToken.address}&toTokenAddress=${toToken.address}&amount=${wei}&slippage=${slippage}`;
      const response = await axios.get(url);

      if (response.status === 200) {
        const tokenObject = response.data;

        // console.log(tokenObject);
        // console.log(tokenObject["tx"]["value"]);
        // console.log(parseInt(tokenObject["tx"]["value"]));

        const transaction = {
          from: tokenObject['tx'].from,
          to: tokenObject['tx'].to,
          data: tokenObject['tx'].data,
          value: `0x${parseInt(tokenObject['tx']['value']).toString(16)}`,
        };

        return new Promise((resolve) => {
          const trySwap = async () =>
            wallet
              .sendTransaction(transaction)
              .then((swap) => {
                if (swap) {
                  console.log(
                    `SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - hash: https://bscscan.com/tx/${swap['hash']}`,
                  );
                  const scannerUrl = `https://bscscan.com/tx/${swap['hash']}`;
                  if (swap['hash']) {
                    if (force) {
                      const checkInterval = setInterval(async () => {
                        axios
                          .get(scannerUrl)
                          .then((response) => {
                            if (response.data.includes(`Fail with error`)) {
                              console.warn(
                                `SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - SWAP failed, retrying...`,
                              );
                              clearInterval(checkInterval);
                              trySwap();
                            } else if (
                              response.data.includes(
                                `<i class='fa fa-check-circle mr-1'></i>Success`,
                              )
                            ) {
                              console.log(
                                `SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - SWAP succeeded.`,
                              );
                              clearInterval(checkInterval);
                              resolve(scannerUrl);
                            } else if (
                              response.data.includes(`Sorry, We are unable to locate this TxnHash`)
                            ) {
                              console.log(
                                `SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - unable to find transaction hash.`,
                              );
                              clearInterval(checkInterval);
                            } else {
                              console.log(
                                `SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - transaction pending...`,
                              );
                            }
                          })
                          .catch((e: any) => {
                            console.error(
                              `SWAP ${amount} ${fromToken.symbol} to ${toToken.symbol} - SWAP failed: ${e}`,
                            );
                            clearInterval(checkInterval);
                            trySwap();
                          });
                      }, 10 * 1000);
                    } else {
                      resolve(scannerUrl);
                    }
                  } else {
                    resolve('');
                  }
                }
              })
              .catch((e: any) => {
                resolve(e);
              });
          trySwap();
        });
      } else {
        console.error(response.statusText);
        return '';
      }
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  /**
   * This will call the api to get an approve transaction, some tokens need to be approved to 0 before increasing again later
   * @param {the number of tokens that are requested to be unlocked, if "null" infinite will be unlocked } value
   * @param {the token address of what tokens needs to be unlocked} tokenAddress
   * @param {the nonce of the transaction} nonce
   * @returns approve transaction data
   */
  async approveApiCaller(tokenAddress: string) {
    const url = `${baseUrl}/${Chain.BinanceSmartChain}/approve/calldata?tokenAddress=${tokenAddress}&infinity=true`;
    const temp: any = await axios
      .get(url)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.status);
        }
        console.log('Error', error.message);
      });
    const result = temp.data;
    delete result.gasPrice;
    delete result.gas;

    const hexValue = ethers.BigNumber.from(result['value'])._hex;
    result['value'] = hexValue; //add a leading 0x after converting from decimal to hexadecimal

    return result; //return the data
  }
}
