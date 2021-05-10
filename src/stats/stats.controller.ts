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

@Controller('stats')
@UseInterceptors(CacheInterceptor)
export class StatsController {
  private readonly logger = new Logger(StatsController.name);
  constructor(private statsService: StatsService) {}
  @Get()
  async getAllStats(): Promise<GeneralStats> {
    this.logger.debug('Called GET /stats');
    return await this.statsService.getAllStats();
  }

  @Get('/overall')
  async getOverallStats(): Promise<GeneralStats> {
    this.logger.debug('Called GET /stats/overall');
    return this.statsService.getDefistationStats();
  }

  @Get('/get')
  async get(): Promise<any> {
    this.logger.debug('Called GET /stats/get');
    return this.statsService.getDefistation();
  }

  @Get(':wallet')
  async getStatsForWallet(@Param('wallet') wallet: string): Promise<string> {
    this.logger.debug('Called GET /stats/:wallet');
    // return this.statsService.getStatsForWallet(wallet);
    return 'Depcrecated';
  }
}
