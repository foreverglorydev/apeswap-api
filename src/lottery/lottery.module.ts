import { CacheModule, Module } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { DrawingService } from './drawing.service';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Draw, DrawSchema } from './schema/draw.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 15,
    }),
    MongooseModule.forFeature([{ name: Draw.name, schema: DrawSchema }]),
  ],
  providers: [LotteryService, DrawingService, ChainConfigService],
  controllers: [LotteryController],
})
export class LotteryModule {}
