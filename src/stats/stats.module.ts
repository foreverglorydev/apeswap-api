import { Module, HttpModule } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SubgraphService } from './subgraph.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [HttpModule],
  providers: [StatsService, SubgraphService],
  controllers: [StatsController],
})
export class StatsModule {}
