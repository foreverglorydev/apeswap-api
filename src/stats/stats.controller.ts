import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SubgraphService } from './subgraph.service';

@Controller('stats')
export class StatsController {
  //private readonly logger = new Logger(DrawingService.name);
  constructor(
    private statsService: StatsService,
    private subgraphService: SubgraphService,
  ) {}
  @Get()
  async getAllStats() {
    const stats = await this.statsService.getAllStats();
    const tvlData = await this.subgraphService.getTVLData();

    stats.tvl += tvlData.tvl;
    stats.totalVolume += tvlData.totalVolume;

    return stats;
  }

  @Get(':wallet')
  async getStatsForWallet(@Param('wallet') wallet: string) {
    return this.statsService.getStatsForWallet(wallet);
  }
}
