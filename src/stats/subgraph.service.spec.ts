import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SubgraphService } from './subgraph.service';

describe('SubgraphService', () => {
  let service: SubgraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [SubgraphService],
    }).compile();

    service = module.get<SubgraphService>(SubgraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be get TVL', async () => {
    const { tvl } = await service.getTVLData();
    expect(tvl).toBeDefined;
  });

  it('should be get pair data', async () => {
    const objPair = {
      derivedBNB: expect.any(String),
      id: expect.any(String),
      reserve0: expect.any(String),
      reserve1: expect.any(String),
      token0Price: expect.any(String),
      token1Price: expect.any(String),
      volumeUSD: expect.any(String),
      totalSupply: expect.any(String),
    };
    const { pairs } = await service.getPairsData();
    for (const pair of pairs) {
      expect(pair).toEqual(expect.objectContaining(objPair));
    }
  });

  it('should be get today data', async () => {
    const objDay = {
      dailyVolumeBNB: expect.any(String),
      dailyVolumeUSD: expect.any(String),
      totalLiquidityBNB: expect.any(String),
      totalLiquidityUSD: expect.any(String),
      totalVolumeUSD: expect.any(String),
    };
    const day = await service.getTodayData();
    expect(day).toEqual(expect.objectContaining(objDay));
  });

  it('should be get daily summary', async () => {
    const summary = await service.getDailySummary();
    expect(summary.tvl).toBeDefined;
    expect(summary.volume).toBeDefined;
    expect(summary.pairs).toBeDefined;
  });

  it('should be get all price data', async () => {
    const objPrice = {
      derivedBNB: expect.any(String),
      id: expect.any(String),
      name: expect.any(String),
      symbol: expect.any(String),
      tokenDayData: expect.any(Array),
    };
    const tokenDayData = {
      dailyTxns: expect.any(String),
      id: expect.any(String),
      priceUSD: expect.any(String),
    };

    const priceData = await service.getAllPriceData();

    expect(priceData).toBeInstanceOf(Array);
    if (priceData.length > 0) {
      expect(priceData[0]).toEqual(expect.objectContaining(objPrice));
      if (priceData[0].tokenDayData.length > 0) {
        expect(priceData[0].tokenDayData[0]).toEqual(
          expect.objectContaining(tokenDayData),
        );
      }
    }
  });
});
