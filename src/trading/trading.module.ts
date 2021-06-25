import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { TradingService } from '../trading/trading.service';
import { TradingController } from './trading.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
  ],
  providers: [TradingService],
  controllers: [TradingController],
})
export class TradingModule {}
