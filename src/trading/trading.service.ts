import { Injectable, Logger, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { ExportToCsv } from 'export-to-csv';
import fs from 'fs';
import { TradeSeason, TradeSeasonDocument } from './schema/trade-season.schema';
import { TradingStats, TradingStatsDocument } from './schema/trading.schema';
import {
  TradingTodayStats,
  TradingTodayStatsDocument,
} from './schema/trading-stats-today.schema';
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
    @InjectModel(TradingTodayStats.name)
    private tradingTodayStatsModel: Model<TradingTodayStatsDocument>,
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
  // @Interval(240000)
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
    this.logger.log('Load Season Data');
    await this.cleanDataTradingSeason(pair, season);
    const startTime =
      latestTimestamp > startTimestamp ? latestTimestamp : startTimestamp;
    const timestamps = this.slpitTimestamp(
      startTime,
      endTimestamp,
      this.querySplit,
    );
    try {
      console.time('process');
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
      pairConfig.latestTimestamp = 0;
      pairConfig.processed = false;
      pairConfig.lastUpdateTimestamp = this.lastUpdateTimestamp;
      await pairConfig.save();
      console.timeEnd('process');
      this.getTopTrading(pair, season);
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
      await this.bulkUpdate(
        userPairDayData,
        season,
        usdPerBanana,
        this.tradingStatsModel,
      );
      pairConfig.latestTimestamp = latestTimestamp;
      await pairConfig.save();
    } else {
      const currentTimestamp = this.getCurrentTimestamp();
      // tolerance for up to 3 hour delay
      const testTimestamp = endTimestamp + 3 * 60 * 60;

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
    yesterday.setHours(23, 59, 59); // local
    const yesterdayUTC = Date.UTC(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDay(),
      23,
      59,
      59,
    );
    const currentTime = this.getCurrentTimestamp();
    const realEnd =
      yesterdayUTC / 1000 > currentTime ? currentTime : yesterdayUTC / 1000;
    const yTime = Math.floor(realEnd);
    const endTime = yTime > end ? end : yTime;
    this.lastUpdateTimestamp = endTime;

    const interval = Math.ceil((endTime - start) / (amount - 1));
    const timeframes = [start];
    this.logger.log(`split timestamp start ${start} to ${endTime}`);
    for (let i = 0; i < amount - 1; i++) {
      const time = timeframes[i];
      const frame = time + interval;
      const efectiveFrame = frame < endTime ? frame : endTime;
      timeframes.push(efectiveFrame);
    }
    return timeframes;
  }

  bulkUpdate(items, season, usdPerBanana, model) {
    const bulkUpdate = model.collection.initializeUnorderedBulkOp();
    for (const item of items) {
      const onInsert = {
        address: item.user.id,
        pair: item.pair.id,
        season: Number(season),
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
      this.logger.log('Hit tradingStats cache');
      return cachedValue as TradingStatsDocument[];
    }
    // this.loadTradingActivity();
    // this.calculateTodaySeasons();
    return this.getTopTrading(pair, season);
  }

  async getPairAddressStats(pair: string, address: string, season: number) {
    const cachedValue = await this.cacheManager.get(`${address}`);
    if (cachedValue) {
      this.logger.log('Hit individual cache');
      return cachedValue;
    }
    const config = await this.getTradeSeason(pair, season);
    const pastData = await this.tradingStatsModel.findOne({
      pair,
      season,
      address,
    });
    const todayData = await this.tradingTodayStatsModel.findOne({
      pair,
      season,
      address,
    });

    if (!pastData && !todayData) return null;

    const pastTrade = pastData?.totalTradedUsd || 0;
    const todayTrade = todayData?.totalTradedUsd || 0;
    const volume = Number(pastTrade) + Number(todayTrade);
    const rewards = volume / config.usdPerBanana;

    const trade = {
      address: address,
      pair: pair,
      season: season,
      pendingBananaRewards: rewards,
      totalTradedUsd: volume,
    };

    await this.cacheManager.set(`${address}`, trade, { ttl: 1100 });
    return trade;
  }

  async getUserCurrentPairData(config, address, pastData) {
    const currentData = await this.subgraphService.getUserCurrentPairData(
      config.pair,
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
      pair: config.pair,
      season: config.season,
      pendingBananaRewards: rewards,
      totalTradedUsd: totalTrade,
    };
  }

  async getTradeSeason(pair, season) {
    return await this.tradeSeasonModel.findOne({
      season: season,
      pair: pair,
    });
  }

  async calculateTodaySeasons() {
    const seasonPairs = await this.getSeasonPairs();
    for (const pairConfig of seasonPairs) {
      this.calculateTodayTrading(pairConfig);
    }
  }
  // @Interval(360000) // 600000 every 10 minutes
  async calculateTodayTrading(pairConfig) {
    const {
      endTimestamp,
      season,
      pair,
      usdPerBanana,
      lastUpdateTimestamp,
      processedToday,
    } = pairConfig;
    if (!pairConfig || !processedToday || lastUpdateTimestamp >= endTimestamp)
      return;
    this.logger.log(`hit calculate today trading to pair ${pair}`);
    await this.cleanDataToday(pair, season);
    const currentTime = this.getCurrentTimestamp();
    console.time('today');
    pairConfig.processedToday = false;
    await pairConfig.save();
    const userPairDayData = await this.subgraphService.getUserDailyPairData(
      pair,
      lastUpdateTimestamp + 1,
      currentTime,
    );
    console.timeEnd('today');
    if (userPairDayData?.length > 0) {
      console.time('bulk');
      await this.bulkUpdate(
        userPairDayData,
        season,
        usdPerBanana,
        this.tradingTodayStatsModel,
      );
      console.timeEnd('bulk');
    }
    pairConfig.processedToday = true;
    await pairConfig.save();
  }

  async getTopTrading(pair, season) {
    this.logger.log('get Top Trading');
    const config = await this.getTradeSeason(pair, season);
    const tradingTodayStats = await this.tradingTodayStatsModel
      .find({ pair, season })
      .sort({ totalTradedUsd: -1 });
    if (tradingTodayStats.length === 0) {
      const tradingStats = await this.tradingStatsModel
        .find({ pair, season })
        .sort({ totalTradedUsd: -1 })
        .limit(100);
      await this.cacheManager.set(
        `tradingStats${pair}-${season}`,
        tradingStats,
        { ttl: 600 },
      );
      return tradingStats;
    }
    this.logger.log('get Top Trading with today stats');
    const tradingStats = await this.tradingStatsModel
      .find({ pair, season })
      .sort({ totalTradedUsd: -1 });

    console.time('calculating');
    for (let index = 0; index < tradingStats.length; index++) {
      const trading = tradingStats[index];
      const idx = tradingTodayStats.findIndex(
        (el) => el.address === trading.address,
      );
      if (idx !== -1) {
        tradingStats[index].totalTradedUsd +=
          tradingTodayStats[idx].totalTradedUsd;
        const reward = tradingStats[index].totalTradedUsd / config.usdPerBanana;
        tradingStats[index].pendingBananaRewards = reward;
        tradingTodayStats.splice(idx, 1);
      }
    }
    let combined = [...tradingStats, ...tradingTodayStats];
    combined.sort((a, b) => {
      if (a.totalTradedUsd < b.totalTradedUsd) return 1;
      else return -1;
    });

    if (combined.length > 100) combined = combined.slice(0, 100);
    console.timeEnd('calculating');
    await this.cacheManager.set(`tradingStats${pair}-${season}`, combined, {
      ttl: 600,
    });
    return combined;
  }
  async cleanDataToday(pair, season) {
    await this.tradingTodayStatsModel.deleteMany({ pair, season });
  }

  async cleanDataTradingSeason(pair, season) {
    await this.tradingStatsModel.deleteMany({ pair, season });
  }

  async tradingExportSeason(pair, season) {
    const config = await this.getTradeSeason(pair, season);
    const data = await this.tradingStatsModel
      .find({ pair, season })
      .sort({ totalTradedUsd: -1 }); // only past trading
    const csv = [];
    let amount = 0;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      csv.push({
        address: element.address,
        totalTradedUsd: element.totalTradedUsd,
        pendingBananaRewards: element.pendingBananaRewards,
      });
      amount += Number(element.totalTradedUsd);
    }
    const startTime = new Date(config.startTimestamp * 1000);
    const endTime = new Date(config.lastUpdateTimestamp * 1000);
    const extraData = [
      {
        address: 'Token: ',
        totalTradedUsd: config.name || config.pair,
        pendingBananaRewards: '',
      },
      {
        address: 'Date: ',
        totalTradedUsd: `${startTime.toUTCString()} to ${endTime.toUTCString()}`,
        pendingBananaRewards: '',
      },
      {
        address: 'Total Amount Trade: ',
        totalTradedUsd: amount,
        pendingBananaRewards: '',
      },
      {
        address: '',
        totalTradedUsd: '',
        pendingBananaRewards: '',
      },
    ];
    const csvExporter = new ExportToCsv();
    const csvData = csvExporter.generateCsv([...extraData, ...csv], true);
    const pathfile = `${season}-${pair}.csv`;
    fs.writeFileSync(pathfile, csvData);
    return pathfile;
  }
}
