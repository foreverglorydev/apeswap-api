import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { TradeSeason, TradeSeasonDocument } from './schema/trade-season.schema';
import { TradingStats, TradingStatsDocument } from './schema/trading.schema';
import { SubgraphService } from '../stats/subgraph.service';
@Injectable()
export class TradingService {
  logger = new Logger(TradingService.name);
  constructor(
    private subgraphService: SubgraphService,
    @InjectModel(TradingStats.name)
    private tradingStatsModel: Model<TradingStatsDocument>,
    @InjectModel(TradeSeason.name)
    private tradeSeasonModel: Model<TradeSeasonDocument>,
  ) {}
  currentSeason = 0;
  processingTimestamps = {};

  async getSeasonPairs() {
    const config = await this.tradeSeasonModel.find({
      season: this.currentSeason,
      processed: { $ne: true },
    });
    return config;
  }

  @Interval(5000)
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
    const startTime =
      latestTimestamp > startTimestamp ? latestTimestamp : startTimestamp;
    try {
      this.processingTimestamps[key] = true;
      this.logger.log(
        `Fetching pair ${pair} from ${startTimestamp} to ${endTimestamp}`,
      );
      const swaps = await this.subgraphService.getPairSwapData(
        pair,
        startTime,
        endTimestamp,
      );
      if (swaps.length) {
        this.logger.log(`${swaps.length} swaps found for given timestamp`);
        const latestTimestamp = swaps[swaps.length - 1].timestamp;
        await this.bulkUpdate(swaps, season, usdPerBanana);
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
      delete this.processingTimestamps[key];

      console.log(swaps);
    } catch (e) {
      this.logger.error(
        `Failed loading data for ${pair} from ${startTimestamp}`,
      );
      this.logger.error(e);
      delete this.processingTimestamps[key];
    }
  }

  getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000);
  }

  bulkUpdate(items, season, usdPerBanana) {
    const bulkUpdate = this.tradingStatsModel.collection.initializeUnorderedBulkOp();
    for (const item of items) {
      const onInsert = {
        address: item.from,
        pair: item.pair.id,
        season,
      };
      const volume = parseFloat(item.amountUSD);
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
    return this.tradingStatsModel
      .find({ pair, season })
      .sort({ totalTradedUsd: -1 })
      .limit(100);
  }

  async getPairAddressStats(pair: string, address: string, season: number) {
    return this.tradingStatsModel.findOne({ pair, season, address });
  }
}
