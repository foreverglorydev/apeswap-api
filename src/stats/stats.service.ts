import { Injectable } from '@nestjs/common';

import { getStatsContract } from './utils/stats.utils';

@Injectable()
export class StatsService {

  getStats(): any {
    return getStatsContract();
  }

}
