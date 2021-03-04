import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  //private readonly logger = new Logger(DrawingService.name);
  constructor(private statsService: StatsService) {}

  @Get()
  getStats() {
    return this.statsService.getStats();
  }

  @Get('reward')
  async getReward() {
    return this.statsService.getReward();
  }

  @Get('prices')
  async getPrices() {
    return this.statsService.getPrices();
  }

  @Get('all')
  async getAllStats() {
    return this.statsService.getAllStats();
  }
}
