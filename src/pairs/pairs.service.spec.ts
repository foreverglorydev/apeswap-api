import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PairsService } from './pairs.service';

describe('PairsService', () => {
  let service: PairsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [PairsService],
    }).compile();

    service = module.get<PairsService>(PairsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get swaps', async () => {
    const swaps = await service.getSwaps(
      '0xdae9a56ef2682f826696eb795dadd9703f5ee199',
    );
    console.log(swaps);
  });

  it('should get liquidity', async () => {
    const swaps = await service.getLiquidity(
      '0x7bd46f6da97312ac2dbd1749f82e202764c0b914',
    );
    console.log(swaps);
  });

  it('should get price', async () => {
    const swaps = await service.getPrice(
      '0x7bd46f6da97312ac2dbd1749f82e202764c0b914',
      'BUSD',
      'BANANA',
    );
    console.log(swaps);
  });
});
