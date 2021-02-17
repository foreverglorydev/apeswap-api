import { HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PairsService } from './pairs.service';
import { Candle, CandleSchema } from './schema/candle.schema';
import { PairHistory, PairHistorySchema } from './schema/pair-history.schema';
import { Pair, PairSchema } from './schema/pair.schema';

describe('PairsService', () => {
  let service: PairsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          envFilePath: ['.development.env', '.env'],
        }),
        MongooseModule.forRoot(process.env.MONGO_URL, { useCreateIndex: true }),
        MongooseModule.forFeature([
          { name: Pair.name, schema: PairSchema },
          { name: PairHistory.name, schema: PairHistorySchema },
          { name: Candle.name, schema: CandleSchema },
        ]),
      ],
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

  it('should create pairs', async () => {
    const newPair = await service.createPair({
      address: '0x7bd46f6da97312ac2dbd1749f82e202764c0b914',
      token: 'BANANA',
      base: 'BUSD',
    });
    console.log(newPair);
  });

  it('should get candle data', async () => {
    const newPair = await service.getCandleData({
      symbol: 'BSC_NONAME',
      address: '0x7bd46f6da97312ac2dbd1749f82e202764c0b914',
      token: 'BANANA',
      base: 'BUSD',
      resolution: 1,
      from: 1607840921,
      to: 1613560264,
    });
    console.log(newPair);
  });

  it('should process pair candles', async () => {
    const newPair = await service.processPairsCandles();
    console.log(newPair);
  });

  it('should get parsed candle data', async () => {
    const newPair = await service.getParsedCandleData({
      symbol: 'BSC_NONAME',
      address: '0x7bd46f6da97312ac2dbd1749f82e202764c0b914',
      token: 'BANANA',
      base: 'BUSD',
      resolution: 1,
      from: 1607840921,
      to: 1613560264,
    });
    console.log(newPair);
  });

  it('should get pairs', async () => {
    const pairs = await service.getPairs();
    console.log(pairs);
  });

  it('should process pairs', async () => {
    const pairs = await service.processPairs();
    console.log(pairs);
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
