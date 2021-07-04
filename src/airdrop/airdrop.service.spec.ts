import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import configuration from 'src/config/configuration';
import { Web3Module } from 'src/web3/web3.module';

import { AirdropService } from './airdrop.service';
describe('Airdop.service', () => {
  let service: AirdropService;

  function createSampleData(length) {
    const addresses = Array(length).fill(
      '0xC9F40d1c8a84b8AeD12A241e7b99682Fb7A3FE84',
    );
    const values = Array(length).fill('123456');
    return { addresses, values };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        Web3Module,
        ConfigModule.forRoot({
          envFilePath: ['.development.env', '.env'],
          load: [configuration],
          isGlobal: true,
        }),
      ],
      providers: [AirdropService, ChainConfigService],
    }).compile();

    service = module.get<AirdropService>(AirdropService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute airdrop', async () => {
    const { addresses, values } = createSampleData(500);
    const airdrop = await service.executeAirdrop(
      '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
      addresses,
      values,
    );
  });
});
