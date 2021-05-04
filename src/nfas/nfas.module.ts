import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NfasTrackingService } from './nfas-tracking.service';
import { NfasController } from './nfas.controller';
import { NfasService } from './nfas.service';
import { NfaTracking, NfaTrackingSchema } from './schema/nfa-tracking.schema';
import { Nfa, NfaSchema } from './schema/nfa.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Nfa.name, schema: NfaSchema },
      { name: NfaTracking.name, schema: NfaTrackingSchema },
    ]),
  ],
  controllers: [NfasController],
  providers: [NfasService, NfasTrackingService],
})
export class NfasModule {}
