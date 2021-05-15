import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from 'src/utils/testing';
import { NfasTrackingService } from './nfas-tracking.service';
import { NfaTracking, NfaTrackingSchema } from './schema/nfa-tracking.schema';

describe('NfasService', () => {
  let service: NfasTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: NfaTracking.name, schema: NfaTrackingSchema },
        ]),
      ],
      providers: [NfasTrackingService],
    }).compile();

    service = module.get<NfasTrackingService>(NfasTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch logs', async () => {
    const logs = await service.fetchLogs({ startBlock: 7108101 });
    console.log(logs);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
