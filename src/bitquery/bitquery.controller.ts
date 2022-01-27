import {
    CacheInterceptor,
    Controller,
    Get,
    Logger,
    Param,
    UseInterceptors,
    Res,
  } from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
import { BitqueryService } from './bitquery.service';
import { PairInformation } from './dto/pairInformation.dto';
  
  @ApiTags('bitquery')
  @Controller('bitquery')
  @UseInterceptors(CacheInterceptor)
  export class BitqueryController {
    private readonly logger = new Logger(BitqueryController.name);
    constructor(
        private bitqueryService: BitqueryService
    ) {}

    @Get('/pair/:network/:address')
    async getPairInformation(
      @Param('address') address: string,
      @Param('network') network: string
    ): Promise<PairInformation> {
      this.logger.debug(`Called GET /pair/${network}/${address}`);
      return await this.bitqueryService.getPairInformation(address, network);
    }
    @Get('/')
    async getBitquery(): Promise<any> {
      return await this.bitqueryService.getTokenInformation(
          '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
          '0x55d398326f99059ff775485246999027b3197955'
        );
    }
  }
  