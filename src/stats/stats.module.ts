import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SubgraphService } from './subgraph.service';
import { PriceService } from './price.service';
import { StatsController } from './stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneralStats, GeneralStatsSchema } from './schema/generalStats.schema';
import { ErrorLogs, ErrorLogsSchema } from './schema/errorLogs.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    MongooseModule.forFeature([
      { name: GeneralStats.name, schema: GeneralStatsSchema },
      { name: ErrorLogs.name, schema: ErrorLogsSchema },
    ]),
  ],
  providers: [StatsService, SubgraphService, PriceService],
  exports: [SubgraphService],
  controllers: [StatsController],
})
export class StatsModule {}
