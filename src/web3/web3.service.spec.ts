import { Test, TestingModule } from '@nestjs/testing';

import { Web3Service } from './web3.service';
describe('Web3Service', () => {
  let service: Web3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [Web3Service],
    }).compile();

    service = module.get<Web3Service>(Web3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get transaction', async () => {
    const transaction = await service.getTransaction(
      '0x0a92c7752d7394beb7a3604effd424671e6cb9036f641f73e00808cef43cd9f6',
    );
    expect(transaction).toBeDefined;
  });
});
