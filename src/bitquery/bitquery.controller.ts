import {
  CacheInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  UseInterceptors,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BitqueryService } from './bitquery.service';
import { CandleDto, CandleOptionsDto } from './dto/candle.dto';
import { PairInformationDto } from './dto/pairInformation.dto';
import { TokenInformationDto } from './dto/tokenInformation.dto';

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
  ): Promise<PairInformationDto> {
    this.logger.debug(`Called GET /pair/${network}/${address}`);
    return await this.bitqueryService.getPairInformation(address, network);
  }
  @Get('/token/:network/:address')
  async getTokenInformation(
    @Param('address') address: string,
    @Param('network') network: string,
  ): Promise<TokenInformationDto> {
    this.logger.debug(`Called GET /token/${network}/${address}`);
    return await this.bitqueryService.getTokenInformation(address, network);
  }
  @Get('/candle/:address')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getCandleToken(
    @Param('address') address: string,
    @Query() candleOptionsDto: CandleOptionsDto,
  ): Promise<CandleDto> {
    this.logger.debug(`Called GET /candle/${address}`);
    return await this.bitqueryService.getCandleToken(address, candleOptionsDto);
  }
}
