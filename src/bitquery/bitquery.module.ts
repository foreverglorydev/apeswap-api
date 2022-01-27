import { Module, HttpModule, CacheModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BitqueryController } from './bitquery.controller';
import { BitqueryService } from './bitquery.service';
import { PairBitquery, PairBitquerySchema } from './schema/pairBitquery.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    MongooseModule.forFeature([{ name: PairBitquery.name, schema: PairBitquerySchema }]),
  ],  
  providers: [BitqueryService],
  controllers: [BitqueryController],
})
export class BitqueryModule {}