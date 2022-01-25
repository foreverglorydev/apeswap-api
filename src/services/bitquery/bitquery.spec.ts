import { HttpModule, HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { tokenInformation } from 'src/stats/utils/subgraph.queries';
import { BitqueryService } from './bitquery.service';

describe('Bitquery Service', () => {
    let service: BitqueryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports:[HttpModule],
            providers: [
                BitqueryService,
                {
                    provide: BitqueryService,
                    useValue: new BitqueryService({url:process.env.BITQUERY_URL, apiKey:process.env.BITQUERY_APYKEY}, new HttpService)
                }
            ],
        }).compile();

        service = module.get<BitqueryService>(BitqueryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    
    it('should be defined url', async () => {
        const data = await service.querySubraph(tokenInformation, `{
            "baseCurrency":"0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
            "quoteCurrency":"0x55d398326f99059ff775485246999027b3197955"
          }`);
        console.log(data)
    });
});
