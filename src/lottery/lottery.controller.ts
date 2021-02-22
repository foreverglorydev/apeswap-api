import { Controller, Get, Param, Query } from '@nestjs/common';
import { LotteryService } from './lottery.service';

@Controller('lottery')
export class LotteryController {
  constructor(private lotteryService: LotteryService) {}

  @Get('history')
  getLotteryHistory() {
    return this.lotteryService.getLotteryHistory();
  }

  @Get(':id')
  getLottery(@Param('id') id: number) {
    return this.lotteryService.getLottery(id);
  }

  @Get()
  getLotteries(@Query() { pageSize, page }) {
    return this.lotteryService.getLotteries(pageSize, page);
  }
}
