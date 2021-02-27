import { Module } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { DrawingService } from './drawing.service';
import { ChainConfigService } from 'src/config/chain.configuration.service';

@Module({
  providers: [LotteryService, DrawingService, ChainConfigService],
  controllers: [LotteryController],
})
export class LotteryModule {}
