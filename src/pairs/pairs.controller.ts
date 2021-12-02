import { Controller, Get, Query } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { GetCandleDataDto } from './pairs.dto';
import { PairsService } from './pairs.service';

@Controller('pairs')
export class PairsController {
  constructor(private pairsService: PairsService) {}

  @ApiExcludeEndpoint()
  @Get()
  candleData(@Query() candleDataDto: GetCandleDataDto) {
    return []; // this.pairsService.getCandleData(candleDataDto)
  }
}
