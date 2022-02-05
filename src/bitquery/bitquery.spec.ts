import { CacheModule, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { gBananaTreasury } from 'src/stats/utils/stats.utils';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from 'src/utils/testing';
import { BitqueryService } from './bitquery.service';
import { CandleOptionsDto } from './dto/candle.dto';
import { PairInformationDto } from './dto/pairInformation.dto';
import { TokenInformationDto } from './dto/tokenInformation.dto';
import { PairBitquery, PairBitquerySchema } from './schema/pairBitquery.schema';
import {
  TokenBitquery,
  TokenBitquerySchema,
} from './schema/tokenBitquery.schema';

describe('Bitquery Service', () => {
  let service: BitqueryService;
  const pairInformation: PairInformationDto = {
    ticker_id: expect.any(String),
    addressLP: expect.any(String),
    base: expect.any(Object),
    target: expect.any(Object),
    liquidity: expect.any(Number),
    quote: expect.any(Object),
  };
  const tokenInformation: TokenInformationDto = {
    name: expect.any(String),
    symbol: expect.any(String),
    address: expect.any(String),
    tokenPrice: expect.any(Number),
    totalSupply: expect.any(Number),
    burntAmount: expect.any(Number),
    circulatingSupply: expect.any(Number),
    marketCap: expect.any(Number),
    quote: expect.any(Object),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({ ttl: 60 }),
        HttpModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: PairBitquery.name, schema: PairBitquerySchema },
          { name: TokenBitquery.name, schema: TokenBitquerySchema },
        ]),
      ],
      providers: [BitqueryService],
    }).compile();

    service = module.get<BitqueryService>(BitqueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be get pair bsc info', async () => {
    const address = '0xf65c1c0478efde3c19b49ecbe7acc57bb6b1d713';
    const network = 'bsc';
    const info = await service.getPairInformation(address, network);
    expect(info).toEqual(expect.objectContaining(pairInformation));
  });

  it('should be get pair matic info', async () => {
    const address = '0x034293f21f1cce5908bc605ce5850df2b1059ac0';
    const network = 'matic';
    const info = await service.getPairInformation(address, network);
    expect(info).toEqual(expect.objectContaining(pairInformation));
  });

  it('should be get token bsc info', async () => {
    const address = '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95';
    const network = 'bsc';
    const info = await service.getTokenInformation(address, network);
    expect(info).toEqual(expect.objectContaining(tokenInformation));
  });

  it('should be get gnana info', async () => {
    const gnanaInfo = {
      circulatingSupply: expect.any(String),
      reserve: expect.any(String),
      supply: expect.any(String),
    };
    const info = await service.getTreasuryGnana(gBananaTreasury());
    expect(info).toEqual(expect.objectContaining(gnanaInfo));
  });

  it('should be get token matic info', async () => {
    const address = '0x5d47baba0d66083c52009271faf3f50dcc01023c';
    const network = 'matic';
    const info = await service.getTokenInformation(address, network);
    expect(info).toEqual(expect.objectContaining(tokenInformation));
  });

  it('should be get token candle', async () => {
    const trade = {
      timeInterval: expect.any(Object),
      baseCurrency: expect.any(Object),
      quoteCurrency: expect.any(Object),
      tradeAmount: expect.any(Number),
      trades: expect.any(Number),
      quotePrice: expect.any(Number),
      maximum_price: expect.any(Number),
      minimum_price: expect.any(Number),
      open_price: expect.any(String),
      close_price: expect.any(String),
    };
    const address = '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95';
    const options: CandleOptionsDto = {
      from: '2022-01-30',
      to: '2022-01-30',
      minTrade: 0,
      interval: 1440,
    };
    const {
      data: {
        ethereum: { dexTrades },
      },
    } = await service.getCandleToken(address, options);
    expect(dexTrades[0]).toEqual(expect.objectContaining(trade));
  });
  afterAll(async () => {
    await closeInMongodConnection();
  });
});
