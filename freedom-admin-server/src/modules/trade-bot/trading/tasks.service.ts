import { Injectable, Logger, Inject, CACHE_MANAGER } from '@nestjs/common';
// import { Interval } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';

export interface TokenItem {
  pair: string;
  chain: string;
  amm: string;
  token0_address: string;
  token0_symbol: string;
  token0_decimal: number;
  token1_address: string;
  token1_symbol: string;
  token1_decimal: number;
  target_token: string;
  reserve0: number;
  reserve1: number;
  token0_price_eth: number;
  token0_price_usd: number;
  token1_price_eth: number;
  token1_price_usd: number;
  price_change: number;
  reserve_change: number;
  created_at: number;
  priceChangePercent: number;
}

function getPercentageChange(oldNumber: number, newNumber: number): number {
  const decreaseValue = Number(newNumber - oldNumber);
  return (decreaseValue / oldNumber) * 100;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.initCache();
  }

  // @Cron('45 * * * * *')
  // handleCron() {
  //   this.logger.debug('该方法将在45秒标记处每分钟运行一次');
  // }

  async initCache() {
    const result = (await this.findAll().pipe().toPromise()) as any;
    if (result && result.data.data.length > 0) {
      await this.cacheManager.set('tokenPriceList', result.data.data, { ttl: 10000000 });
      this.logger.debug('初始化完成');
    }
  }

  // @Interval(10000)
  // async handleInterval() {
  //   this.logger.debug('2');
  // }

  // @Interval(1000 * 60 * 30)
  async handleTimeout() {
    this.logger.debug('开始拉取');

    const result = (await this.findAll().pipe().toPromise()) as any;
    if (result && result.data.data.length > 0) {
      //上次缓存的值
      const preTokenPriceList =
        ((await this.cacheManager.get('tokenPriceList')) as TokenItem[]) || [];
      const calcPriceChange = result.data.data
        .map((tokenItem: TokenItem) => {
          const preToken = preTokenPriceList.find(
            (preItem: TokenItem) => preItem.target_token === tokenItem.target_token,
          );
          const priceChangePercent = preToken
            ? getPercentageChange(preToken.token1_price_usd, tokenItem.token1_price_usd)
            : 0;
          return {
            ...tokenItem,
            priceChangePercent,
          };
        })
        .sort((a: TokenItem, b: TokenItem) => b.priceChangePercent - a.priceChangePercent);
      await this.cacheManager.set('tokenPriceList', calcPriceChange, { ttl: 10000000 });
      let str = '涨幅榜 Top20\n';
      calcPriceChange.slice(0, 20).forEach((item: TokenItem, index: number) => {
        if (item.token1_symbol === 'WBNB') {
          const tmpToken1_symbol = item.token1_symbol;
          item.token1_symbol = item.token0_symbol;
          item.token0_symbol = tmpToken1_symbol;
        }
        const line = `
        ${index + 1}. 代币名称：${item.token1_symbol}/${item.token0_symbol}
        合约：${item.target_token}
        当前价格：${item.token1_price_usd}
        涨跌幅：${item.priceChangePercent.toFixed(2)}%\n`;
        str += line;
      });

      // str += '\n跌幅榜 Top10\n';
      // calcPriceChange.slice(-10).forEach((item: TokenItem, index: number) => {
      //   if (item.token1_symbol === 'WBNB') {
      //     const tmpToken1_symbol = item.token1_symbol;
      //     item.token1_symbol = item.token0_symbol;
      //     item.token0_symbol = tmpToken1_symbol;
      //   }
      //   const line = `
      //   ${index + 1}. 代币名称：${item.token1_symbol}/${item.token0_symbol}
      //     合约：${item.target_token}
      //     当前价格：${item.token1_price_usd}
      //     涨跌幅：${item.priceChangePercent}%\n`;
      //   str += line;
      // });
      if (preTokenPriceList) {
        this.sendEmail(str);
      }
    }
  }

  // @Interval(10000)
  sendEmail(template: string) {
    this.emailService.sendEmail(template);
  }

  findAll(): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      'https://avedex.cc/v1api/v1/pairs?pageNO=1&pageSize=50000&sort=created_at&direction=desc&chain=bsc&minPoolSize=100000',
      {
        headers: {
          Authorization: 'ea88c22fdf68db4dac1ac605e7c798ac2be6e94f1636878458449',
        },
      },
    );
  }
}
