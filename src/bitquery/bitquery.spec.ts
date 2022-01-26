import { HttpModule, HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { tokenInformation } from 'src/stats/utils/subgraph.queries';
import { BitqueryService } from './bitquery.service';

describe('Bitquery Service', () => {
    let service: BitqueryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports:[HttpModule],
            providers:[BitqueryService]
        }).compile();

        service = module.get<BitqueryService>(BitqueryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    
    it('should be get token info', async () => {
        const obj = {
            transfers: expect.any(Array),
            dexTrades: expect.any(Array),
        };
        const infoTransfer = {
            minted: expect.any(Number),
            burned: expect.any(Number)
        }
        const infoDexTrade = {
            quotePrice: expect.any(Number)
        }
        const { data: { ethereum} } = await service.getTokenInformation('0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95','0x55d398326f99059ff775485246999027b3197955');
        expect(ethereum).toEqual(expect.objectContaining(obj));
        expect(ethereum.transfers[0]).toEqual(expect.objectContaining(infoTransfer));
        expect(ethereum.dexTrades[0]).toEqual(expect.objectContaining(infoDexTrade));
    });
    
    it('should be get error token info', async () => {
        const obj = {
            transfers: expect.any(null),
            dexTrades: expect.any(null),
        };
        const objError = {
            message: expect.any(String)
        };
        const { errors } = await service.getTokenInformation('0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a9s','0x55d398326f99059ff775485246999027b3197955');
        expect(errors[0]).toEqual(expect.objectContaining(objError));
    });
});
