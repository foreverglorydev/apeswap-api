import { Injectable, HttpService, Logger } from '@nestjs/common';
import {
  dayData,
  pairsQuery,
  liquidityQuery,
  allPricesQuery,
  swapsData,
  usersPairDayData,
} from './utils/subgraph.queries';

@Injectable()
export class SubgraphService {
  logger = new Logger(SubgraphService.name);
  graphUrl =
    'https://graph.apeswap.finance/subgraphs/name/ape-swap/apeswap-subgraph';
  failoverUrl = process.env.FAILOVER_URL;

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

  async getPairSwapData(
    pair: string,
    startTime: number,
    endTime: number,
    first = 1000,
    skip = 0,
  ): Promise<any> {
    const query = swapsData(pair, startTime, endTime, first, skip);
    const { data } = await this.querySubraph(query);
    let result = data.swaps;
    if (result?.length === 1000) {
      // Paginate
      const swaps = await this.getPairSwapData(
        pair,
        startTime,
        endTime,
        first,
        first + skip,
      );
      result = [...result, ...swaps];
      this.logger.log(`swapsData result length: ${result.length}`);
    }
    return result;
  }

  async getUserDailyPairData(
    pair: string,
    startTime: number,
    endTime: number,
    first = 1000,
    skip = 0,
  ): Promise<any> {
    const query = usersPairDayData(pair, startTime, endTime, first, skip);
    this.logger.log(query);
    const res = await this.querySubraph(query);
    let result = res.data.userPairDayDatas;
    if (result?.length === 1000) {
      // Paginate
      const userPairDayDatas = await this.getUserDailyPairData(
        pair,
        startTime,
        endTime,
        first,
        first + skip,
      );
      result = [...result, ...userPairDayDatas];
      this.logger.log(`getUserDailyPairData result length: ${result.length}`);
    }
    return result;
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

  async getAllPriceData() {
    const { data } = await this.querySubraph(allPricesQuery);
    return data.tokens;
  }

  async querySubraph(query): Promise<any> {
    const { data } = await this.httpService
      .post(this.failoverUrl, { query })
      .toPromise();
    return data;
  }
}
