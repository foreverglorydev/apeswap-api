import {
  CacheInterceptor,
  Controller,
  Get,
  Post,
  Logger,
  Param,
  UseInterceptors,
  Res,
  Body,
} from '@nestjs/common';
import { TradingAllInfoDto } from './dto/tradingAllInfo.dto';
import { TradingDataDto } from './dto/tradingData.dto';
import { TradingStatsDocument } from './schema/trading.schema';
import { TradingService } from './trading.service';

@Controller('trading')
@UseInterceptors(CacheInterceptor)
export class TradingController {
  private readonly logger = new Logger(TradingController.name);
  constructor(private tradingService: TradingService) {}

  @Get('export/:season/:pair')
  async tradingExportSeason(
    @Param('pair') pair: string,
    @Param('address') address: string,
    @Param('season') season: number,
    @Res() res,
  ): Promise<any> {
    this.logger.debug('Called GET /export/:season/:pair');
    const pathfile = await this.tradingService.tradingExportSeason(
      pair,
      season,
    );
    return res.download(pathfile, pathfile);
  }

  @Get(':season/:pair/:address')
  async getStatsForSeason(
    @Param('pair') pair: string,
    @Param('season') season: number,
    @Param('address') address: string,
  ): Promise<TradingAllInfoDto | any> {
    this.logger.debug('Called GET /trading/:season/:pair');
    return this.tradingService.getPairLeaderBoard(season, pair, address);
  }

  // @Get(':season/:pair/:address')
  // async getStatsForAddress(
  //   @Param('pair') pair: string,
  //   @Param('address') address: string,
  //   @Param('season') season: number,
  // ): Promise<any> {
  //   this.logger.debug('Called GET /trading/:season/:pair/:address');
  //   return this.tradingService.getPairAddressStats(pair, address, season);
  // }
}
