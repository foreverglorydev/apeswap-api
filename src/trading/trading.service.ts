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
    });
    return config;
  }

  @Interval(5000)
  async loadTradingActivity() {
    this.logger.log('Load trading activity');
    const seasonPairs = await this.getSeasonPairs();
    for (const pairConfig of seasonPairs) {
      this.loadPairData(pairConfig);
    }
  }

  async loadPairData(pairConfig) {
    const { latestTimestamp, season, pair, usdPerBanana } = pairConfig;
    const key = latestTimestamp + pair;
    if (this.processingTimestamps[key]) {
      this.logger.log(`Timestamp already being processed ${key}`);
      return;
    }
    try {
      this.processingTimestamps[key] = true;
      this.logger.log(`Fetching pair ${pair} from ${latestTimestamp}`);
      const swaps = await this.subgraphService.getPairSwapData(
        pair,
        latestTimestamp,
      );
      if (swaps.length) {
        await this.bulkUpdate(swaps, season, usdPerBanana);
        pairConfig.latestTimestamp = swaps[swaps.length - 1].timestamp;
        await pairConfig.save();
      }
      delete this.processingTimestamps[key];

      console.log(swaps);
    } catch (e) {
      this.logger.error(
        `Failed loading data for ${pair} from ${latestTimestamp}`,
      );
      this.logger.error(e);
      delete this.processingTimestamps[key];
    }
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
