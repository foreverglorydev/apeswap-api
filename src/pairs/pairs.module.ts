import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PairsController } from './pairs.controller';
import { PairsService } from './pairs.service';
import { Candle, CandleSchema } from './schema/candle.schema';
import { PairHistory, PairHistorySchema } from './schema/pair-history.schema';
import { Pair, PairSchema } from './schema/pair.schema';
// https://chartex.pro/?symbol=BSC_APESWAPFINANCE%3ABUSD%2FBANANA.0xdae9a56ef2682f826696eb795dadd9703f5ee199&interval=60&theme=Dark
@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Pair.name, schema: PairSchema },
      { name: PairHistory.name, schema: PairHistorySchema },
      { name: Candle.name, schema: CandleSchema },
    ]),
  ],
  controllers: [PairsController],
  providers: [PairsService],
})
export class PairsModule {}
