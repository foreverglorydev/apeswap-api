import {
  CacheInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { DrawingService } from './drawing.service';
import { LotteryService } from './lottery.service';

@Controller('lottery')
export class LotteryController {
  private readonly logger = new Logger(DrawingService.name);
  constructor(
    private lotteryService: LotteryService,
    private drawingService: DrawingService,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @Get()
  getLotteries(@Query() { pageSize, page }) {
    return this.lotteryService.getLotteries(pageSize, page);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('history')
  getLotteryHistory() {
    return this.lotteryService.getLotteryHistory();
  }

  @Get('draw')
  async drawLottery() {
    try {
      await this.drawingService.enterDrawing();
      await this.drawingService.draw();
      return 'success';
    } catch (e) {
      this.logger.error(e);
      return 'error';
    }
  }

  @Get('reset')
  async resetLottery() {
    try {
      await this.drawingService.reset();
      return 'success';
    } catch (e) {
      this.logger.error(e);
      return 'error';
    }
  }

  @Get('process')
  async processLottery() {
    try {
      return this.drawingService.process();
    } catch (e) {
      this.logger.error(e);
      return 'error';
    }
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  getLottery(@Param('id') id: number) {
    return this.lotteryService.getLottery(id);
  }
}
