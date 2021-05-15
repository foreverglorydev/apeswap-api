import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { TradingService } from '../trading/trading.service';
import { TradingStats, TradingStatsSchema } from './schema/trading.schema';
import { TradeSeason, TradeSeasonSchema } from './schema/trade-season.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsModule } from 'src/stats/stats.module';
import { TradingController } from './trading.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    StatsModule,
    MongooseModule.forFeature([
      { name: TradingStats.name, schema: TradingStatsSchema },
      { name: TradeSeason.name, schema: TradeSeasonSchema },
    ]),
  ],
  providers: [TradingService],
  controllers: [TradingController],
})
export class TradingModule {}
