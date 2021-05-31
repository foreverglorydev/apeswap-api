import { Injectable, Logger, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { TradeSeason, TradeSeasonDocument } from './schema/trade-season.schema';
import { TradingStats, TradingStatsDocument } from './schema/trading.schema';
import { SubgraphService } from '../stats/subgraph.service';
@Injectable()
export class TradingService {
  logger = new Logger(TradingService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private subgraphService: SubgraphService,
    @InjectModel(TradingStats.name)
    private tradingStatsModel: Model<TradingStatsDocument>,
    @InjectModel(TradeSeason.name)
    private tradeSeasonModel: Model<TradeSeasonDocument>,
  ) {}
  currentSeason = 0;
  querySplit = 10;
  processingTimestamps = {};
  lastUpdateTimestamp = 0;

  async getSeasonPairs() {
    const config = await this.tradeSeasonModel.find({
      season: this.currentSeason,
      processed: { $ne: true },
      finished: { $ne: true },
    });
    return config;
  }

  // @Interval(50000) @Cron('59 59 23 * * *')
  // @Interval(50000)
  async loadTradingActivity() {
    this.logger.log('Load trading activity');
    const seasonPairs = await this.getSeasonPairs();
    for (const pairConfig of seasonPairs) {
      this.loadSeasonData(pairConfig);
    }
  }

  async loadSeasonData(pairConfig) {
    const {
      startTimestamp,
      endTimestamp,
      season,
      pair,
      latestTimestamp,
      usdPerBanana,
    } = pairConfig;
    const key = season + pair;
    if (this.processingTimestamps[key]) {
      this.logger.log(`Timestamp already being processed ${key}`);
      return;
    }

    if (this.isFinished(endTimestamp)) return;

    const startTime =
      latestTimestamp > startTimestamp ? latestTimestamp : startTimestamp;
    const timestamps = this.slpitTimestamp(
      startTime,
      endTimestamp,
      this.querySplit,
    );
    try {
      for (let i = 0; i < timestamps.length - 1; i++) {
        this.processingTimestamps[key] = true;
        await this.processInterval(
          pair,
          timestamps[i + 1],
          timestamps[i],
          season,
          usdPerBanana,
          pairConfig,
        );
      }

      delete this.processingTimestamps[key];
      this.cachedTrading(pair, season);
      pairConfig.latestTimestamp = 0;
      pairConfig.lastUpdateTimestamp = this.lastUpdateTimestamp;
      await pairConfig.save();
      console.timeEnd('process');
    } catch (e) {
      this.logger.error(
        `Failed loading data for ${pair} from ${startTimestamp}`,
      );
      this.logger.error(e);
      delete this.processingTimestamps[key];
      console.timeEnd('process');
    }
  }

  private async processInterval(
    pair: any,
    endTimestamp: any,
    startTime: any,
    season: any,
    usdPerBanana: any,
    pairConfig: any,
  ) {
    this.logger.log(
      `Fetching pair ${pair} from ${startTime} to ${endTimestamp}`,
    );
    const userPairDayData = await this.subgraphService.getUserDailyPairData(
      pair,
      startTime,
      endTimestamp,
    );
    if (userPairDayData.length) {
      this.logger.log(
        `${userPairDayData.length} swaps found for given timestamp`,
      );
      const latestTimestamp = userPairDayData[userPairDayData.length - 1].date;
      await this.bulkUpdate(userPairDayData, season, usdPerBanana);
      pairConfig.latestTimestamp = latestTimestamp;
      await pairConfig.save();
    } else {
      const currentTimestamp = this.getCurrentTimestamp();
      // tolerance for up to 3 hour delay
      const testTimestamp = endTimestamp + 3 * 60 * 60;
      console.log(currentTimestamp, testTimestamp);
      if (currentTimestamp > testTimestamp) {
        this.logger.log(
          `Finished processing season: ${season} for pair: ${pair}`,
        );
        pairConfig.processed = true;
        await pairConfig.save();
      }
    }
    return userPairDayData;
  }

  getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000);
  }

  slpitTimestamp(start, end, amount) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59);
    const yTime = Math.floor(yesterday.getTime() / 1000);
    const endTime = yTime > end ? end : yTime;
    this.lastUpdateTimestamp = endTime;

    const interval = Math.ceil((endTime - start) / (amount - 1));
    const timeframes = [start];

    for (let i = 0; i < amount - 1; i++) {
      const time = timeframes[i];
      const frame = time + interval;
      const efectiveFrame = frame < endTime ? frame : endTime;
      timeframes.push(efectiveFrame);
    }
    return timeframes;
  }

  bulkUpdate(items, season, usdPerBanana) {
    const bulkUpdate = this.tradingStatsModel.collection.initializeUnorderedBulkOp();
    for (const item of items) {
      const onInsert = {
        address: item.user.id,
        pair: item.pair.id,
        season,
      };
      const volume = parseFloat(item.dailyVolumeUSD);
      const rewards = volume / usdPerBanana;
      const inc = { totalTradedUsd: volume, pendingBananaRewards: rewards };
      if (item !== null) {
        bulkUpdate
          .find({
            address: onInsert.address,
            pair: onInsert.pair,
            season: onInsert.season,
          })
          .upsert()
          .updateOne({
            $inc: inc,
            $setOnInsert: onInsert,
          });
      }
    }
    return bulkUpdate.execute();
  }

  async getPairLeaderBoard(pair: string, season: number) {
    const cachedValue = await this.cacheManager.get('tradingStats');
    if (cachedValue) {
      this.logger.log('Hit calculateStats() cache');
      return cachedValue as TradingStatsDocument[];
    }
    const tradingStats = await this.tradingStatsModel
      .find({ pair, season })
      .sort({ totalTradedUsd: -1 })
      .limit(100);
    await this.cacheManager.set('tradingStats', tradingStats, { ttl: 600 });

    return tradingStats;
  }

  async getPairAddressStats(pair: string, address: string, season: number) {
    const pastData = await this.tradingStatsModel.findOne({
      pair,
      season,
      address,
    });
    return this.getUserCurrentPairData(pair, season, address, pastData);
  }

  async getUserCurrentPairData(pair, season, address, pastData) {
    const config = await this.tradeSeasonModel.findOne({
      season: season,
      pair: pair,
    });

    const currentData = await this.subgraphService.getUserCurrentPairData(
      pair,
      config.lastUpdateTimestamp + 1,
      Math.floor(new Date().getTime() / 1000),
      address,
    );

    let totalTrade = pastData?.totalTradedUsd || 0;

    for (let index = 0; index < currentData.length; index++) {
      const current = currentData[index];
      totalTrade += parseFloat(current.dailyVolumeUSD);
    }

    const volume = parseFloat(totalTrade);
    const rewards = volume / config.usdPerBanana;

    return {
      account: pastData?.account || address,
      pair: pair,
      season: season,
      pendingBananaRewards: rewards,
      totalTradedUsd: totalTrade,
    };
  }

  async cachedTrading(pair, season) {
    console.log('Hit cached trading');
    const tradingStats = await this.tradingStatsModel.find({ pair, season });
    await this.cacheManager.set('tradingStats', tradingStats, { ttl: 600 });
  }

  isFinished(endTimestamp) {
    const currentTime = this.getCurrentTimestamp();
    if (endTimestamp < currentTime) return true;
    return false;
  }
}
