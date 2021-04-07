import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PriceService } from './price.service';
import { SubgraphService } from './subgraph.service';

describe('PriceService', () => {
  let service: PriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [PriceService, SubgraphService],
    }).compile();

    service = module.get<PriceService>(PriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have getTokenPrices return an object with each address having usd as property', async () => {
    const { prices } = await service.getTokenPrices();
    expect(prices).toBeDefined;
    for (const key in prices) {
      // for each token in prices
      expect(Object.keys(prices[key])).toEqual(['usd']); //it should contain the property 'usd'
    }
  });
});
