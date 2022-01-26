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
  
  @ApiTags('bitquery')
  @Controller('bitquery')
  export class BitqueryController {
    
    constructor(
        private bitqueryService: BitqueryService
    ) {}

    @Get('/')
    async getBitquery(): Promise<any> {
      return await this.bitqueryService.getTokenInformation(
          '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a9s',
          '0x55d398326f99059ff775485246999027b3197955'
        );
    }
  }
  