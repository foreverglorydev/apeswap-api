import { Controller, Get } from '@nestjs/common';
import { PairsService } from './pairs.service';

@Controller('pairs')
export class PairsController {
  constructor(private pairsService: PairsService) {}

  @Get()
  candleData() {
    return []; // this.pairsService.getCandleData(candleDataDto)
  }
}
