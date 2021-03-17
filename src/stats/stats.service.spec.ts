import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [StatsService],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all stats', async () => {
    const objStats = {
      bananaPrice: expect.any(Number),
      burntAmount: expect.any(Number),
      totalSupply: expect.any(Number),
      marketCap: expect.any(Number),
      pools: expect.any(Array),
      farms: expect.any(Array),
      incentivizedPools: expect.any(Array),
    };
    const stats = await service.getAllStats();
    expect(stats).toEqual(expect.objectContaining(objStats));
  });

  it('should get stats for wallet', async () => {
    const objWallet = {
      tvl: expect.any(Number),
      bananaPrice: expect.any(Number),
      aggregateApr: expect.any(Number),
      aggregateAprPerDay: expect.any(Number),
      aggregateAprPerWeek: expect.any(Number),
      aggregateAprPerMonth: expect.any(Number),
      bananasEarnedPerDay: expect.any(Number),
      bananasEarnedPerWeek: expect.any(Number),
      bananasEarnedPerMonth: expect.any(Number),
      bananasEarnedPerYear: expect.any(Number),
      dollarsEarnedPerDay: expect.any(Number),
      dollarsEarnedPerWeek: expect.any(Number),
      dollarsEarnedPerMonth: expect.any(Number),
      dollarsEarnedPerYear: expect.any(Number),
      bananasInWallet: expect.any(Number),
      pendingReward: expect.any(Number),
      pools: expect.any(Array),
      farms: expect.any(Array),
      incentivizedPools: expect.any(Array),
    };
    const wallet = '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6';
    const statsWallet = await service.getStatsForWallet(wallet);
    expect(statsWallet).toEqual(expect.objectContaining(objWallet));
  });

  it('should show invalid wallet address error code', async () => {
    const objCodeError = {
      code: expect.any(Number),
      msg: expect.any(String),
    };
    const wallet = '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da';
    const statsWallet = await service.getStatsForWallet(wallet);

    expect(statsWallet).toEqual(expect.objectContaining(objCodeError));
  });
});
