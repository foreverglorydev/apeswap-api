import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  TradeSession,
  TradeSessionDocument,
} from './schema/trade-session.schema';
import {
  TradeTracking,
  TradeTrackingDocument,
} from './schema/trade-tracking.schema';
import { TradingStats, TradingStatsDocument } from './schema/trading.schema';
import { SubgraphService } from '../stats/subgraph.service';

@Injectable()
export class TradingService {
  logger = new Logger(TradingService.name);
  constructor(
    private subgraphService: SubgraphService,
    @InjectModel(TradingStats.name)
    private tradingStatsModel: Model<TradingStatsDocument>,
    @InjectModel(TradeTracking.name)
    private tradeTrackingModel: Model<TradeTrackingDocument>,
    @InjectModel(TradeSession.name)
    private tradeSessionModel: Model<TradeSessionDocument>,
  ) {}
  pairsToTrack = ['0xf65c1c0478efde3c19b49ecbe7acc57bb6b1d713'];
  latestTimestamp = 0;

  @Interval(5000)
  async loadTradingActivity() {
    this.logger.log('Load trading');
    for (const pair of this.pairsToTrack) {
      this.loadPairData(pair);
    }
  }

  async loadPairData(pair) {
    const latestTimestamp = await this.getLatestTimestamp();
    this.logger.log(`Fetching from ${latestTimestamp}`);
    const swaps = await this.subgraphService.getPairSwapData(
      pair,
      latestTimestamp,
    );

    this.update(swaps[swaps.length - 1].timestamp);

    this.bulkUpdate(swaps);

    console.log(swaps);
  }

  async getLatestTimestamp() {
    const result = await this.tradingStatsModel.db
      .collection('latestTimestamp')
      .findOne({});
    return result.latestTimestamp;
  }

  async update(latestTimestamp) {
    this.tradingStatsModel.db
      .collection('latestTimestamp')
      .updateOne({}, { $set: { latestTimestamp } }, { upsert: true });
  }

  bulkUpdate(items) {
    const bulkUpdate = this.tradingStatsModel.collection.initializeUnorderedBulkOp();
    for (const item of items) {
      const onInsert = {
        address: item.from,
        pair: item.pair.id,
        season: 1,
      };
      if (item !== null) {
        bulkUpdate
          .find({
            address: onInsert.address,
            pair: onInsert.pair,
            season: onInsert.season,
          })
          .upsert()
          .updateOne({
            $inc: { totalTradedUsd: parseFloat(item.amountUSD) },
            $setOnInsert: onInsert,
          });
      }
    }
    return bulkUpdate.execute();
  }
}
