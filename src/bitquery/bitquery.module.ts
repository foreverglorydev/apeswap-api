import { Module, HttpModule, CacheModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BitqueryController } from './bitquery.controller';
import { BitqueryService } from './bitquery.service';
import { PairBitquery, PairBitquerySchema } from './schema/pairBitquery.schema';
import { TokenBitquery, TokenBitquerySchema } from './schema/tokenBitquery.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    MongooseModule.forFeature([
      { name: PairBitquery.name, schema: PairBitquerySchema },
      { name: TokenBitquery.name, schema: TokenBitquerySchema }
    ]),
  ],  
  providers: [BitqueryService],
  controllers: [BitqueryController],
})
export class BitqueryModule {}