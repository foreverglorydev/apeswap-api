import { CacheModule, Module, HttpModule, HttpService } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SubgraphService } from './subgraph.service';
import { PriceService } from './price.service';
import { StatsController } from './stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneralStats, GeneralStatsSchema } from './schema/generalStats.schema';
import { TvlStats, TvlStatsSchema } from './schema/tvlStats.schema';
import { BitqueryModule } from 'src/services/bitquery/bitquery.module';
import { ConfigModule } from '@nestjs/config';

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
    ]),
    BitqueryModule.forRoot({ url: process.env.BITQUERY_URL, apiKey: process.env.BITQUERY_APIKEY })
  ],
  providers: [StatsService, SubgraphService, PriceService],
  exports: [SubgraphService],
  controllers: [StatsController],
})
export class StatsModule {}
