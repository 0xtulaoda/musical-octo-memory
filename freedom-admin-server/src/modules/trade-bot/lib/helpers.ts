import InputDataDecoder from 'ethereum-input-data-decoder';
import { PancakeSwapABI } from '../abis/pancake-swap-abi';
const decoder = new InputDataDecoder(PancakeSwapABI as any);
import Web3 from 'web3';
import { readFileSync } from 'fs';
import sound from 'sound-play';
import { join, resolve } from 'path';

// /**
//  * Checks if the given string is a checksummed address
//  *
//  * @method isChecksumAddress
//  * @param {String} address the given HEX adress
//  * @return {Boolean}
//  */
// export const isChecksumAddress = function (address: string) {
//   // Check each case
//   address = address.replace('0x', '');
//   const addressHash = sha3(address.toLowerCase());
//   for (let i = 0; i < 40; i++) {
//     // the nth letter should be uppercase if the nth digit of casemap is 1
//     if (
//       (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
//       (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])
//     ) {
//       return false;
//     }
//   }
//   return true;
// };

// /**
//  * Checks if the given string is an address
//  *
//  * @method isAddress
//  * @param {String} address the given HEX adress
//  * @return {Boolean}
//  */
// export const isAddress = function (address: string) {
//   if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
//     // check if it has the basic requirements of an address
//     return false;
//   } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
//     // If it's all small caps or all all caps, return true
//     return true;
//   } else {
//     // Otherwise check each case
//     return isChecksumAddress(address);
//   }
// };

/**
 * Decode PancakeSwap input token
 *
 * @method getPancakeInputToken
 * @param {TransactionInput}
 * @return {Token}
 */
export const getPancakeInputToken = function (input: string) {
  const result = decoder.decodeData(input);
  const routes = result.inputs ? result.inputs.find((route) => Array.isArray(route)) : false;
  return routes ? `0x${routes[routes.length - 1]}` : '';
};

/**
 * Get PancakeSwap token URL
 *
 * @method getPancakeTokenURL
 * @param {String} token the given token
 * @return {String}
 */
export const getPancakeTokenURL = function (token: string, v1 = false) {
  if (process.env.NETWORK === 'testnet') {
    return `https://${v1 ? 'v1' : ''}pancake.kiemtienonline360.com/#/swap?outputCurrency=${token}`;
  }
  return `https://${v1 ? 'v1' : ''}exchange.pancakeswap.finance/#/swap?outputCurrency=${token}`;
};

/**
 * Get Poocoin token URL
 *
 * @method getPoocoinTokenURL
 * @param {String} token the given token
 * @return {String}
 */
export const getPoocoinTokenURL = function (token: string) {
  return `https://poocoin.app/tokens/${token}`;
};

/**
 * Get BscScan Transaction URL
 *
 * @method getBscScanTxURL
 * @param {String}
 * @return {String}
 */
export const getBscScanTxURL = function (txHash: string) {
  if (process.env.NETWORK === 'testnet') {
    return `https://testnet.bscscan.com/tx/${txHash}`;
  }
  return `https://bscscan.com/tx/${txHash}`;
};

/**
 * Get BscScan Transaction URL
 *
 * @method getBscScanURL
 * @param {String}
 * @return {String}
 */
export const getBscScanURL = function () {
  if (process.env.NETWORK === 'testnet') {
    return `https://api-testnet.bscscan.com/api`;
  }
  return `https://api.bscscan.com/api`;
};

// /**
//  * Get Web3 connection
//  *
//  * @method getWeb3Connection
//  * @return {Web3}
//  */
// export const getWeb3Connection = function () {
//   const network = process.env.NETWORK ? process.env.NETWORK : 'mainnet';
//   const apiKey = process.env.GETBLOCK_API_KEY;
//   if (!apiKey) {
//     throw 'GetBlock.io API Key needed';
//   }
//   const wssRpc =
//     network === 'mainnet'
//       ? `wss://speedy-nodes-nyc.moralis.io/8c3cdaade08b4615613bcfee/bsc/mainnet/archive/ws`
//       : `wss://speedy-nodes-nyc.moralis.io/8c3cdaade08b4615613bcfee/bsc/testnet/ws`;
//   return new Web3(wssRpc);
// };

/**
 * Get Web3 connection
 *
 * @method getWeb3Connection
 * @return {Web3}
 */
export const getWeb3Connection = function () {
  // const network = process.env.NETWORK ? process.env.NETWORK : 'mainnet';
  const apiKey = process.env.GETBLOCK_API_KEY;
  if (!apiKey) {
    throw 'GetBlock.io API Key needed';
  }
  return new Web3(`wss://bsc-ws-node.nariox.org:443`);
};

/**
 * Get wallets to watch
 *
 * @method getWallets
 * @return {Array} address
 */
export const getWallets = function () {
  return readFileSync('src/modules/trade-bot/.wallets')
    .toString()
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((item) => item.length > 0);
};

/**
 * Play sound
 *
 * @method playSound
 * @param {String} sound name
 * @return {Promise}
 */
export const playSound = async function (name: string) {
  const filePath = join(resolve(), `sound/${name}.mp3`);
  return await sound.play(filePath);
};

/**
 * Checks if the given router address is PancakeSwap V1
 *
 * @method isPancakeSwapV1Token
 * @param {Transaction}
 * @return {Boolean}
 */
export const isPancakeSwapV1Router = function (router: string) {
  return router.toLowerCase() === '0x05ff2b0db69458a0750badebc4f9e13add608c7f';
};
