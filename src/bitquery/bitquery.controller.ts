import {
  CacheInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BitqueryService } from './bitquery.service';
import { CandleOptions } from './dto/candle.dto';
import { PairInformation } from './dto/pairInformation.dto';
import { TokenInformation } from './dto/tokenInformation.dto';

@ApiTags('bitquery')
@Controller('bitquery')
@UseInterceptors(CacheInterceptor)
export class BitqueryController {
  private readonly logger = new Logger(BitqueryController.name);
  constructor(private bitqueryService: BitqueryService) {}

  @Get('/pair/:network/:address')
  async getPairInformation(
    @Param('address') address: string,
    @Param('network') network: string,
  ): Promise<PairInformation> {
    this.logger.debug(`Called GET /pair/${network}/${address}`);
    return await this.bitqueryService.getPairInformation(address, network);
  }
  @Get('/token/:network/:address')
  async getBitquery(
    @Param('address') address: string,
    @Param('network') network: string,
  ): Promise<TokenInformation> {
    this.logger.debug(`Called GET /token/${network}/${address}`);
    return await this.bitqueryService.getTokenInformation(address, network);
  }
  @Get('/candle/:address')
  async getCandleToken(
    @Param('address') address: string,
    @Query() candleOptionsDto: CandleOptions,
  ): Promise<any> {
    this.logger.debug(`Called GET /candle/${address}`);
    return await this.bitqueryService.getCandleToken(address, candleOptionsDto);
  }
}
