import {
  CacheInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GeneralStats } from 'src/interfaces/stats/generalStats.interface';
import { GeneralStatsChain } from 'src/interfaces/stats/tvl.interface';
import { WalletStats } from 'src/interfaces/stats/walletStats.interface';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
@UseInterceptors(CacheInterceptor)
export class StatsController {
  private readonly logger = new Logger(StatsController.name);
  constructor(private statsService: StatsService) {}
  
  @ApiOkResponse({
    description: 'Retrieved task by ID successfully',
    type: GeneralStats
  })
  @Get()
  async getAllStats(): Promise<GeneralStats> {
    this.logger.debug('Called GET /stats');
    return await this.statsService.getAllStats();
  }

  @Get('/tvl')
  async getTvlStats(): Promise<GeneralStatsChain> {
    this.logger.debug('Called GET /tvl');
    return await this.statsService.getTvlStats();
  }

  @Get('/overall')
  async getOverallStats(): Promise<GeneralStats> {
    this.logger.debug('Called GET /stats/overall');
    return this.statsService.getDefistationStats();
  }

  @Get('/supply')
  async getSupply(): Promise<number> {
    this.logger.debug('Called GET /stats/supply');
    const { circulatingSupply } = await this.statsService.getBurnAndSupply();
    return circulatingSupply;
  }

  @Get('/farmPrices')
  async getFarmPrices(): Promise<any> {
    this.logger.debug('Called GET /stats/farmPrices');
    return await this.statsService.getFarmPrices();
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
