import {
  CacheInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { SubgraphService } from './subgraph.service';

@Controller('stats')
@UseInterceptors(CacheInterceptor)
export class StatsController {
  private readonly logger = new Logger(StatsController.name);
  constructor(
    private statsService: StatsService,
    private subgraphService: SubgraphService,
  ) {}
  @Get()
  async getAllStats() {
    this.logger.debug('Called GET /stats');
    const stats = await this.statsService.getAllStats();
    const tvlData = await this.subgraphService.getTVLData();

    stats.tvl += tvlData.tvl;
    stats.totalVolume += tvlData.totalVolume;

    return stats;
  }

  @Get(':wallet')
  async getStatsForWallet(@Param('wallet') wallet: string) {
    this.logger.debug('Called GET /stats/:wallet');
    return this.statsService.getStatsForWallet(wallet);
  }
}
