import { Injectable, HttpService } from '@nestjs/common';

import { getCoinGeckoPrices } from './utils/price.utils';
import { coinGeckoTokens } from 'src/utils/coinGeckoTokens';

@Injectable()
export class PriceService {
  constructor(private httpService: HttpService) {}

  async getTokenPrices(): Promise<any> {
    const prices = await getCoinGeckoPrices(this.httpService, coinGeckoTokens);
    return prices;
  }
}
