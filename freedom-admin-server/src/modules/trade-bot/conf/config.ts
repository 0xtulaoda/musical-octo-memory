import { ethers } from 'ethers';

//  fixed thresholds for buying and selling
export const threshold = 0.03;
export const chainId = 56;

// interval of price check (ms)
export const interval = 10 * 1000;

// amount of DAI token trading per a single buy/sell action
export const baseTradingAmount = ethers.utils.parseUnits('3.0', 18);

export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

export const explorerURL = 'https://bscscan.com/';
