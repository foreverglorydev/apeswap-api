import { Test, TestingModule } from '@nestjs/testing';
import { NfasService } from './nfas.service';

describe('NfasService', () => {
  let service: NfasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfasService],
    }).compile();

    service = module.get<NfasService>(NfasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
