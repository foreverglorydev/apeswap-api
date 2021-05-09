import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SubgraphService } from './subgraph.service';
import { PriceService } from './price.service';
import { StatsController } from './stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneralStats, GeneralStatsSchema } from './schema/generalStats.schema';
import { TradingService } from './trading.service';
import { TradingStats, TradingStatsSchema } from './schema/trading.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    MongooseModule.forFeature([
      { name: GeneralStats.name, schema: GeneralStatsSchema },
      { name: TradingStats.name, schema: TradingStatsSchema },
    ]),
  ],
  providers: [StatsService, SubgraphService, PriceService, TradingService],
  controllers: [StatsController],
})
export class StatsModule {}
