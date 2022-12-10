import 'dotenv/config';
import Web3 from 'web3';

export const getWeb3 = () => {
  /**
   * 56: Mainnet
   * 97: Testnet
   */
  const NETWORK = process.env.NETWORK;
  const provider =
    NETWORK === 'MAINNET'
      ? (process.env.BSC_HTTP_MAINNET as string)
      : (process.env.BSC_WSS_TESTNET as string);

  return new Web3(new Web3.providers.HttpProvider(provider)) as any;
};

export default getWeb3;
