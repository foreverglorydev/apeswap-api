import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SubgraphService } from './subgraph.service';
import { PriceService } from './price.service';
import { StatsController } from './stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneralStats, GeneralStatsSchema } from './schema/generalStats.schema';
import { TvlStats, TvlStatsSchema } from './schema/tvlStats.schema';
import {
  GeneralStatsNetwork,
  GeneralStatsNetworkSchema,
} from './schema/generalStatsNetwork.schema';
import { StatsNetworkService } from './stats.network.service';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { ConfigModule } from '@nestjs/config';
import { BitqueryService } from 'src/bitquery/bitquery.service';
import {
  PairBitquery,
  PairBitquerySchema,
} from 'src/bitquery/schema/pairBitquery.schema';
import {
  TokenBitquery,
  TokenBitquerySchema,
} from 'src/bitquery/schema/tokenBitquery.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    ConfigModule.forRoot({
      envFilePath: ['.development.env', '.env'],
      isGlobal: true,
    }),
    HttpModule,
    MongooseModule.forFeature([
      { name: GeneralStats.name, schema: GeneralStatsSchema },
      { name: TvlStats.name, schema: TvlStatsSchema },
      { name: GeneralStatsNetwork.name, schema: GeneralStatsNetworkSchema },
      { name: PairBitquery.name, schema: PairBitquerySchema },
      { name: TokenBitquery.name, schema: TokenBitquerySchema },
    ]),
  ],
  providers: [
    StatsService,
    SubgraphService,
    PriceService,
    StatsNetworkService,
    ChainConfigService,
    BitqueryService,
  ],
  exports: [SubgraphService],
  controllers: [StatsController],
})
export class StatsModule {}
