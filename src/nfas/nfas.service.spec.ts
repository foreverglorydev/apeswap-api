import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';

import { NfasService } from './nfas.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from 'src//utils/testing';
import { NfaSchema } from './schema/nfa.schema';

describe('NfasService', () => {
  let service: NfasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'Nfa', schema: NfaSchema }]),
      ],
      providers: [NfasService],
    }).compile();

    service = module.get<NfasService>(NfasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
