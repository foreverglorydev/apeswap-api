import { Injectable, HttpService } from '@nestjs/common';

import {
  getStatsContract,
  getReward,
  getAllPrices,
  getAllStats,
} from './utils/stats.utils';

@Injectable()
export class StatsService {
  constructor(private httpService: HttpService) {}

  getStats(): any {
    return getStatsContract();
  }

  async getReward(): Promise<any> {
    const reward = await getReward();
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
}
