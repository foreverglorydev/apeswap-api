import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetCandleDataDto } from './pairs.dto';
import { PairsService } from './pairs.service';

@ApiTags('pairs')
@Controller('pairs')
export class PairsController {
  constructor(private pairsService: PairsService) {}

  @Get()
  candleData(@Query() candleDataDto: GetCandleDataDto) {
    return []; // this.pairsService.getCandleData(candleDataDto)
  }
}
