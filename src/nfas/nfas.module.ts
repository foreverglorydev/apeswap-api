import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NfasController } from './nfas.controller';
import { NfasService } from './nfas.service';
import { Nfa, NfaSchema } from './schema/nfa.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Nfa.name, schema: NfaSchema }]),
  ],
  controllers: [NfasController],
  providers: [NfasService],
})
export class NfasModule {}
