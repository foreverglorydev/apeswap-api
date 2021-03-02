import { Injectable } from '@nestjs/common';

import { getStatsContract, getReward } from './utils/stats.utils';

@Injectable()
export class StatsService {

  getStats(): any {
    return getStatsContract();
  }

  async getReward(): Promise<any>{
    const reward = await getReward();
    console.log(reward);
    return reward;
  }

}
