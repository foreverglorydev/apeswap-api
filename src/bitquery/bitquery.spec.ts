import { HttpModule, HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BitqueryService } from './bitquery.service';
import { PairInformation } from './dto/pairInformation.dto';

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
        const info = await service.getPairInformation(address,network);
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
        const info = await service.getPairInformation(address,network);
        expect(info).toEqual(expect.objectContaining(pairInfo));
    });
    
    // it('should be get token info', async () => {
    //     const obj = {
    //         transfers: expect.any(Array),
    //         dexTrades: expect.any(Array),
    //     };
    //     const infoTransfer = {
    //         minted: expect.any(Number),
    //         burned: expect.any(Number)
    //     }
    //     const infoDexTrade = {
    //         quotePrice: expect.any(Number)
    //     }
    //     const { data: { ethereum} } = await service.getTokenInformation('0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95','0x55d398326f99059ff775485246999027b3197955');
    //     expect(ethereum).toEqual(expect.objectContaining(obj));
    //     expect(ethereum.transfers[0]).toEqual(expect.objectContaining(infoTransfer));
    //     expect(ethereum.dexTrades[0]).toEqual(expect.objectContaining(infoDexTrade));
    // });
    
    // it('should be get error token info', async () => {
    //     const obj = {
    //         transfers: expect.any(null),
    //         dexTrades: expect.any(null),
    //     };
    //     const objError = {
    //         message: expect.any(String)
    //     };
    //     const { errors } = await service.getTokenInformation('0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a9s','0x55d398326f99059ff775485246999027b3197955');
    //     expect(errors[0]).toEqual(expect.objectContaining(objError));
    // });
});
