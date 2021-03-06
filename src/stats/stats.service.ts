import { Injectable, HttpService } from '@nestjs/common';

import { getRewardsPerDay, getAllPrices, getAllStats, getWalletStats } from './utils/stats.utils';

@Injectable()
export class StatsService {
  constructor(private httpService: HttpService) {}

  async getReward(): Promise<any> {
    const reward = await getRewardsPerDay();
    console.log(reward);
    return reward;
  }

  async getPrices(): Promise<any> {
    const reward = await getAllPrices(this.httpService);
    console.log(reward);
    return reward;
  }

  async getAllStats(): Promise<any> {
    return getAllStats(this.httpService);
  }

  async getStatsForWallet(wallet): Promise<any> {
    return getWalletStats(this.httpService, wallet);
  }
}
