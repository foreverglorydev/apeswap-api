import { CacheModule, HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import { TradingService } from './trading.service';

jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});
describe('StatsService', () => {
  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  let service: TradingService;
  const season = 0;
  const pair = '0xf65c1c0478efde3c19b49ecbe7acc57bb6b1d713';
  const seasonInfo = {
    season: 0,
    pair: '0xf65c1c0478efde3c19b49ecbe7acc57bb6b1d713',
    name: 'Banana',
    startTimestamp: '1622419200',
    endTimestamp: '1624579199',
    finished: false,
    rewards: 2500,
  };
  const trading = [
    {
      user: '0x07f4b4534cb02dda9a971f2358685cd8dcad1d57',
      volume: '1718930.9790819077633230685770433156',
      prize: '687.5723916327631053292274308173',
      rank: '1',
    },
    {
      user: '0x48bcac2dc244d4a8010dfbd6ede964d8d8487223',
      volume: '676681.2522586038262729531549821378',
      prize: '270.6725009034415305091812619929',
      rank: '2',
    },
    {
      user: 'axxx',
      volume: '288437.94645957208806710287590683487',
      prize: '115.37517858382883522684115036273',
      rank: '3',
    },
  ];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ ttl: 60 }), HttpModule],
      providers: [TradingService],
    }).compile();

    service = module.get<TradingService>(TradingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be calculate individual trading', async () => {
    const address = 'axxx';
    const individual = {
      address: expect.any(String),
      volume: expect.any(Number),
      prize: expect.any(Number),
      position: expect.any(Number),
    };
    const individualStats = await service.calculateIndividualStats(
      seasonInfo,
      trading,
      address,
    );
    expect(individual).toEqual(expect.objectContaining(individualStats));
  });

  it('should have not a position', async () => {
    const address = 'axx';
    const individualStats = await service.calculateIndividualStats(
      seasonInfo,
      trading,
      address,
    );
    expect(0).toEqual(individualStats.position);
  });

  it('should be in position 3', async () => {
    const address = 'axxx';
    const individualStats = await service.calculateIndividualStats(
      seasonInfo,
      trading,
      address,
    );
    expect(3).toEqual(individualStats.position);
  });

  it('should be get season info', async () => {
    const seasonValidate = {
      season: expect.any(Number),
      pair: expect.any(String),
      name: expect.any(String),
      startTimestamp: expect.any(String),
      endTimestamp: expect.any(String),
      finished: expect.any(Boolean),
      rewards: expect.any(Number),
      token1: expect.any(Object),
      token2: expect.any(Object),
    };
    const seasonInfo = await service.getPairInformation(pair, season, true);
    expect(seasonValidate).toEqual(expect.objectContaining(seasonInfo));
  });

  it('should fetch all trading', async () => {
    client.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 1,
    });
    const personal = {
      season: {
        season: expect.any(Number),
        pair: expect.any(String),
        name: expect.any(String),
        startTimestamp: expect.any(String),
        endTimestamp: expect.any(String),
        finished: expect.any(Boolean),
        rewards: expect.any(Number),
        token1: expect.any(Object),
        token2: expect.any(Object),
      },
      individual: {
        address: expect.any(String),
        volume: expect.any(Number),
        prize: expect.any(Number),
        position: expect.any(Number),
      },
      trading: expect.any(Array),
    };
    const trading = await service.getPairLeaderBoardWithUser(0, pair, 'dx');
    expect(trading).toEqual(expect.objectContaining(personal));
  });
});
