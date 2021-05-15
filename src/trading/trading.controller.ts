import {
  CacheInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { TradingStatsDocument } from './schema/trading.schema';
import { TradingService } from './trading.service';

@Controller('trading')
@UseInterceptors(CacheInterceptor)
export class TradingController {
  private readonly logger = new Logger(TradingController.name);
  constructor(private tradingService: TradingService) {}

  @Get(':season/:pair')
  async getStatsForWallet(
    @Param('pair') pair: string,
    @Param('season') season: number,
  ): Promise<TradingStatsDocument[]> {
    this.logger.debug('Called GET /trading/:wallet');
    return this.tradingService.getPairLeaderBoard(pair, season);
  }
}
