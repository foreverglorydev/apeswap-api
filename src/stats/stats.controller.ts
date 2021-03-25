import {
  CacheInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { GeneralStats } from 'src/interfaces/stats/generalStats.interface';
import { WalletStats } from 'src/interfaces/stats/walletStats.interface';
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
  async getAllStats(): Promise<GeneralStats> {
    this.logger.debug('Called GET /stats');
    return await this.statsService.getAllStats();
  }

  @Get(':wallet')
  async getStatsForWallet(@Param('wallet') wallet: string): Promise<any> {
    this.logger.debug('Called GET /stats/:wallet');
    return [];
    //return this.statsService.getStatsForWallet(wallet);
  }
}
