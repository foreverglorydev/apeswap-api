import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { TradingService } from '../trading/trading.service';
import { TradingStats, TradingStatsSchema } from './schema/trading.schema';
import {
  TradeSession,
  TradeSessionSchema,
} from '../trading/schema/trade-session.schema';
import {
  TradeTracking,
  TradeTrackingSchema,
} from './schema/trade-tracking.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    StatsModule,
    MongooseModule.forFeature([
      { name: TradingStats.name, schema: TradingStatsSchema },
      { name: TradeSession.name, schema: TradeSessionSchema },
      { name: TradeTracking.name, schema: TradeTrackingSchema },
    ]),
  ],
  providers: [TradingService],
  controllers: [],
})
export class TradingModule {}
