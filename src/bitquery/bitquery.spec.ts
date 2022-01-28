import { CacheModule, HttpModule, HttpService } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { closeInMongodConnection, rootMongooseTestModule } from 'src/utils/testing';
import { BitqueryService } from './bitquery.service';
import { PairInformation } from './dto/pairInformation.dto';
import { TokenInformation } from './dto/tokenInformation.dto';
import { PairBitquery, PairBitquerySchema } from './schema/pairBitquery.schema';
import { TokenBitquery, TokenBitquerySchema } from './schema/tokenBitquery.schema';

describe('Bitquery Service', () => {
    let service: BitqueryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                CacheModule.register({ ttl: 60 }),
                HttpModule,
                rootMongooseTestModule(),
                MongooseModule.forFeature([
                    { name: PairBitquery.name, schema: PairBitquerySchema },
                    { name: TokenBitquery.name, schema: TokenBitquerySchema }
                ]),
            ],
            providers: [BitqueryService]
        }).compile();

        service = module.get<BitqueryService>(BitqueryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should be get pair bsc info', async () => {
        const pairInfo: PairInformation = {
            ticker_id: expect.any(String),
            base: expect.any(String),
            target: expect.any(String),
            amount: expect.any(Number),
            value_usd: expect.any(Number),
            address: expect.any(String),
            base_address: expect.any(String),
            target_address: expect.any(String),
            price: expect.any(Number),
            quote_currency_address: expect.any(String)
        };
        const address = '0xf65c1c0478efde3c19b49ecbe7acc57bb6b1d713';
        const network = 'bsc';
        const info = await service.getPairInformation(address, network);
        expect(info).toEqual(expect.objectContaining(pairInfo));
    });

    it('should be get pair matic info', async () => {
        const pairInfo: PairInformation = {
            ticker_id: expect.any(String),
            base: expect.any(String),
            target: expect.any(String),
            amount: expect.any(Number),
            value_usd: expect.any(Number),
            address: expect.any(String),
            base_address: expect.any(String),
            target_address: expect.any(String),
            price: expect.any(Number),
            quote_currency_address: expect.any(String)
        };
        const address = '0x034293f21f1cce5908bc605ce5850df2b1059ac0';
        const network = 'matic';
        const info = await service.getPairInformation(address, network);
        expect(info).toEqual(expect.objectContaining(pairInfo));
    });

    it('should be get token bsc info', async () => {
        const tokenInfo: TokenInformation = {
            name: expect.any(String),
            symbol: expect.any(String),
            address: expect.any(String),
            tokenPrice: expect.any(Number),
            totalSupply: expect.any(Number),
            burntAmount: expect.any(Number),
            circulatingSupply: expect.any(Number),
            marketCap: expect.any(Number)
        };
        const address = '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95';
        const network = 'bsc';
        const info = await service.getTokenInformation(address, network);
        expect(info).toEqual(expect.objectContaining(tokenInfo));
    });

    it('should be get token matic info', async () => {
        const tokenInfo: TokenInformation = {
            name: expect.any(String),
            symbol: expect.any(String),
            address: expect.any(String),
            tokenPrice: expect.any(Number),
            totalSupply: expect.any(Number),
            burntAmount: expect.any(Number),
            circulatingSupply: expect.any(Number),
            marketCap: expect.any(Number)
        };
        const address = '0x5d47baba0d66083c52009271faf3f50dcc01023c';
        const network = 'matic';
        const info = await service.getTokenInformation(address, network);
        expect(info).toEqual(expect.objectContaining(tokenInfo));
    });
    afterAll(async () => {
        await closeInMongodConnection();
    });
});
