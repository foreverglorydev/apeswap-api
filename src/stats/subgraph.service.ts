import { Injectable, HttpService } from '@nestjs/common';

import { getSubgraphData } from './utils/subgraph.utils';

@Injectable()
export class SubgraphService {
  constructor(private httpService: HttpService) {}

  async getTVLData(): Promise<any> {
    const { data } = await getSubgraphData(this.httpService);
    const tvlData = {
      tvl: parseFloat(data.uniswapFactory.totalLiquidityUSD),
      tvlInBnb: parseFloat(data.uniswapFactory.totalLiquidityETH),
      totalVolume: parseFloat(data.uniswapFactory.totalVolumeUSD),
    };
    return tvlData;
  }
}
