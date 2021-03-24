import { Injectable, HttpService } from '@nestjs/common';

import { PriceService } from './price.service';
import { getAllStats, getWalletStats } from './utils/stats.utils';

@Injectable()
export class StatsService {
  constructor(
    private httpService: HttpService,
    private priceService: PriceService,
  ) {}

  async getAllStats(): Promise<any> {
    const prices = await this.priceService.getTokenPrices();
    return getAllStats(this.httpService, prices);
  }

  async getStatsForWallet(wallet): Promise<any> {
    const prices = await this.priceService.getTokenPrices();
    return getWalletStats(this.httpService, wallet, prices);
  }
}
