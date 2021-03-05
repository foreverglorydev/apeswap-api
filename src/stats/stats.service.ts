import { Injectable, HttpService } from '@nestjs/common';

import {
  getReward,
  getAllPrices,
  getAllStats,
} from './utils/stats.utils';

@Injectable()
export class StatsService {
  constructor(private httpService: HttpService) {}

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
