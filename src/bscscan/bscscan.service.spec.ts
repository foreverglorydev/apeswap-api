import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BscscanService } from './bscscan.service';
import { writeFile } from 'fs/promises';

describe('BscscanService', () => {
  let service: BscscanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [BscscanService],
    }).compile();

    service = module.get<BscscanService>(BscscanService);
    jest.setTimeout(2000000); // ms
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get transactions', async () => {
    const transactions = await service.getDragonaryIaoTransactions({
      startBlock: 9843269,
      endBlock: 9945280,
    });
    // console.log(transactions.data.result);
    console.log(transactions.data.result.length);
    expect(service).toBeDefined();
  });

  it('should get all IAO transactions', async () => {
    const transactions = await service.getAllIaoTransactions({
      startBlock: 9843269,
      endBlock: 9945280,
    });
    // console.log(transactions.data.result);
    console.log(transactions.length);
  });

  it('should get all unrewarded IAO transactions', async () => {
    const transactions = await service.getUnrewardedTransactions({
      startBlock: 9843269,
      endBlock: 9945280,
    });
    // console.log(transactions);
    console.log(transactions.length);

    // stringify JSON Object
    const jsonContent = JSON.stringify(transactions);

    await writeFile('output.json', jsonContent, 'utf8');
  });
});
