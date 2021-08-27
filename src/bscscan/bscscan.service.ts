import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class BscscanService {
  constructor(private httpService: HttpService) {}

  apiUrl = 'https://api.bscscan.com/api';
  async getDragonaryIaoTransactions({ startBlock, endBlock }) {
    const transactions = await this.httpService
      .get(
        `${this.apiUrl}?module=account&action=tokentx&address=0x9bc1bc6c4010a2b0384c59b9513d841aa8b5bdf4&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=JE8EGK4IK2C5PA5IQN7PC68BSJH3SI7EW5`,
      )
      .toPromise();
    return transactions;
  }

  async getAllIaoTransactions({ startBlock, endBlock }) {
    let transactions;
    const { data } = await this.getDragonaryIaoTransactions({
      startBlock,
      endBlock,
    });
    if (data.result.length) {
      transactions = data.result;
      if (data.result.length === 10000) {
        console.log('More results');
        const lastBlock = parseInt(
          data.result[data.result.length - 1].blockNumber,
        );
        const result = await this.getAllIaoTransactions({
          startBlock: lastBlock,
          endBlock,
        });
        transactions = [...transactions, ...result];
      }
    }
    // console.log(transactions);
    return transactions;
  }

  async getUnrewardedTransactions({ startBlock, endBlock }) {
    const transactions = await this.getAllIaoTransactions({
      startBlock,
      endBlock,
    });
    return transactions.filter(
      (tx) =>
        tx.value === '0' &&
        tx.contractAddress === '0xd9025e25bb6cf39f8c926a704039d2dd51088063',
    );
  }
}
