import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { NfasAuctionService } from './nfas-auction.service';
import { NfasTrackingService } from './nfas-tracking.service';
import { NfasController } from './nfas.controller';
import { NfasService } from './nfas.service';
import { NfaAuction, NfaAuctionSchema } from './schema/nfa-auction.schema';
import { NfaTracking, NfaTrackingSchema } from './schema/nfa-tracking.schema';
import { Nfa, NfaSchema } from './schema/nfa.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    MongooseModule.forFeature([
      { name: Nfa.name, schema: NfaSchema },
      { name: NfaTracking.name, schema: NfaTrackingSchema },
      { name: NfaAuction.name, schema: NfaAuctionSchema },
    ]),
  ],
  controllers: [NfasController],
  providers: [
    NfasService,
    NfasTrackingService,
    NfasAuctionService,
    ChainConfigService,
  ],
})
export class NfasModule {}
