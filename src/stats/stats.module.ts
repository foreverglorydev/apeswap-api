import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SubgraphService } from './subgraph.service';
import { StatsController } from './stats.controller';
import { PriceService } from './price.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 15,
    }),
    HttpModule,
  ],
  providers: [StatsService, SubgraphService, PriceService],
  controllers: [StatsController],
})
export class StatsModule {}
