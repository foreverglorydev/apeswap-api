import { Injectable, HttpService } from '@nestjs/common';
import {
  dayData,
  pairsQuery,
  liquidityQuery,
  allPricesQuery,
} from './utils/subgraph.queries';

@Injectable()
export class SubgraphService {
  graphUrl =
    'https://graph.apeswap.finance/subgraphs/name/ape-swap/apeswap-subgraph';
  constructor(private httpService: HttpService) {}

  async getVolumeData(): Promise<any> {
    const { data } = await this.querySubraph(liquidityQuery);
    const volumeData = {
      liquidity: parseFloat(data.uniswapFactory.totalLiquidityUSD),
      totalVolume: parseFloat(data.uniswapFactory.totalVolumeUSD),
    };
    return volumeData;
  }

  async getPairsData(): Promise<any> {
    const { data } = await this.querySubraph(pairsQuery);
    return data;
  }

  async getDayData(startTimestamp: number, endTimestamp: number): Promise<any> {
    const { data } = await this.querySubraph(
      dayData(0, startTimestamp, endTimestamp),
    );
    return data;
  }

  async getTodayData(): Promise<any> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const yTimestamp = Math.round(yesterday.getTime() / 1000);
    const nowTimestamp = Math.round(new Date().getTime() / 1000);
    const { apeswapDayDatas } = await this.getDayData(yTimestamp, nowTimestamp);
    return apeswapDayDatas[1] || apeswapDayDatas[0];
  }

  async getDailySummary() {
    const [dailyData, tvlData, pairData] = await Promise.all([
      this.getTodayData(),
      this.getVolumeData(),
      this.getPairsData(),
    ]);
    return {
      volume: dailyData.dailyVolumeUSD,
      tvl: tvlData.tvl,
      pairs: pairData.pairs,
    };
  }

  async getAllPriceData(skip = 0, first = 1000) {
    const { data } = await this.querySubraph(allPricesQuery(skip, first));
    let tokens = data.tokens;
    if (tokens?.length === 1000) {
      const swaps = await this.getAllPriceData(first + skip, first);
      tokens = [...tokens, ...swaps];
    }
    return tokens;
  }

  async querySubraph(query): Promise<any> {
    const { data } = await this.httpService
      .post(this.graphUrl, { query })
      .toPromise();
    return data;
  }
}
