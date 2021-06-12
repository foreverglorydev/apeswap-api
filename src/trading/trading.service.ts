import { Injectable, Logger, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, Interval } from '@nestjs/schedule';
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
  currentSeason = 1;
  querySplit = 10;
  processingTimestamps = {};
  lastUpdateTimestamp = 0;

  async getSeasonPairs() {
    const config = await this.tradeSeasonModel.find({
      season: this.currentSeason,
      processed: { $ne: true },
    });
    return config;
  }

  // @Interval(10000)
  @Cron('0 20 * * * *') // runs every hour on minute 20
  async loadTradingActivity() {
    this.logger.log('Load trading activity');
    console.log(new Date());
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
    const key = `${season}-${pair}`;
    if (this.processingTimestamps[key]) {
      this.logger.log(`Timestamp already being processed ${key}`);
      return;
    }
    this.logger.log('Load Season Data');
    const endTime =
      this.getEndOfDayTimestamp() < endTimestamp
        ? this.getEndOfDayTimestamp()
        : endTimestamp;

    if (endTime >= latestTimestamp) {
      this.logger.log(`Timestamp already processed ${key}`);
      return;
    }
    console.time(`process-pair-${pair}`);
    try {
      this.processingTimestamps[key] = true;
      await this.processInterval(
        pair,
        endTime,
        startTimestamp,
        season,
        usdPerBanana,
        pairConfig,
      );
      pairConfig.latestTimestamp = endTime;
      pairConfig.processed = endTime === endTimestamp;
      await pairConfig.save();

      console.timeEnd(`process-pair-${pair}`);
      this.getTopTrading(pair, season);
      delete this.processingTimestamps[key];
    } catch (e) {
      this.logger.error(
        `Failed loading data for ${pair} from ${startTimestamp}`,
      );
      this.logger.error(e);
      delete this.processingTimestamps[key];
      console.timeEnd(`process-pair-${pair}`);
    }
  }

  private async processInterval(
    pair: string,
    endTimestamp: number,
    startTime: number,
    season: number,
    usdPerBanana: number,
    pairConfig: TradeSeasonDocument,
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
      await this.cleanDataTradingSeason(pair, season);
      await this.bulkUpdate(
        userPairDayData,
        season,
        usdPerBanana,
        this.tradingStatsModel,
      );
      pairConfig.latestTimestamp = latestTimestamp;
      await pairConfig.save();
    }
    return userPairDayData;
  }

  getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000);
  }

  getEndOfDayTimestamp() {
    const today = new Date();
    const todayUtc = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
    );
    return Math.floor(todayUtc / 1000) - 1;
  }

  calculateEndTime(endTimestamp) {
    const currentTime = this.getCurrentTimestamp();
    if (currentTime > endTimestamp) return endTimestamp;

    const yesterday = new Date();
    // yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayUTC = Date.UTC(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      23,
      59,
      59,
    );
    return Math.floor(yesterdayUTC / 1000);
  }

  slpitTimestamp(start, end, amount) {
    const endTime = this.calculateEndTime(end);
    this.lastUpdateTimestamp = endTime;

    const timeframes = [start, endTime];
    return timeframes;
    /*
      const interval = Math.ceil((endTime - start) / (amount - 1));
      this.logger.log(`split timestamp start ${start} to ${endTime}`);
      for (let i = 0; i < amount - 1; i++) {
        const time = timeframes[i];
        const frame = time + interval;
        const efectiveFrame = frame < endTime ? frame : endTime;
        timeframes.push(efectiveFrame);
      }
      return timeframes; 
    */
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

    await this.cacheManager.set(`${address}-${pair}-${season}`, trade, {
      ttl: 720,
    });
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

  @Interval(600000)
  async calculateTodaySeasons() {
    const seasonPairs = await this.getSeasonPairs();
    for (const pairConfig of seasonPairs) {
      this.calculateTodayTrading(pairConfig);
    }
  }

  async calculateTodayTrading(pairConfig) {
    const {
      endTimestamp,
      season,
      pair,
      usdPerBanana,
      latestTimestamp,
    } = pairConfig;
    if (!pairConfig || latestTimestamp >= endTimestamp) return;
    this.logger.log(`hit calculate today trading to pair ${pair}`);
    await this.cleanDataToday(pair, season);
    const currentTime = this.getCurrentTimestamp();
    console.time(`today-${season}-${pair}`);
    await pairConfig.save();
    const userPairDayData = await this.subgraphService.getUserDailyPairData(
      pair,
      latestTimestamp,
      currentTime,
    );
    console.timeEnd(`today-${season}-${pair}`);
    if (userPairDayData?.length > 0) {
      console.time(`bulk-${season}-${pair}`);
      await this.bulkUpdate(
        userPairDayData,
        season,
        usdPerBanana,
        this.tradingTodayStatsModel,
      );
      console.timeEnd(`bulk-${season}-${pair}`);
    }
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

    console.time(`calculating-${season}-${pair}`);
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
    console.timeEnd(`calculating-${season}-${pair}`);
    await this.cacheManager.set(`tradingStats${pair}-${season}`, combined, {
      ttl: 600,
    });
    return combined;
  }

  async cleanDataToday(pair, season) {
    this.logger.log(`Cleaning today ${season}-${pair}`);
    await this.tradingTodayStatsModel.deleteMany({ pair, season });
  }

  async cleanDataTradingSeason(pair, season) {
    this.logger.log(`Cleaning ${season}-${pair}`);
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
    const endTime = new Date(config.latestTimestamp * 1000);
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
