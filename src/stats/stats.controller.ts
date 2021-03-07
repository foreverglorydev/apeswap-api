import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  //private readonly logger = new Logger(DrawingService.name);
  constructor(private statsService: StatsService) {}
  @Get()
  async getAllStats() {
    return this.statsService.getAllStats();
  }

  @Get('burnt')
  async getBurntBanana() {
    return this.statsService.getBurntBanana();
  }
  
  @Get(':wallet')
  async getStatsForWallet(@Param('wallet') wallet: string) {
    return this.statsService.getStatsForWallet(wallet);
  }

}
