import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { TradingService } from '../trading/trading.service';
import { StatsModule } from 'src/stats/stats.module';
import { TradingController } from './trading.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    StatsModule,
  ],
  providers: [TradingService],
  controllers: [TradingController],
})
export class TradingModule {}
