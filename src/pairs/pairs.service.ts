import { HttpService, Injectable } from '@nestjs/common';
import { poolBalance, swap } from './pair.queries';

@Injectable()
export class PairsService {
  constructor(private httpService: HttpService) {}

  async getSwaps(pairAddress: string) {
    const query = swap(pairAddress);
    const { data } = await this.httpService
      .post('https://graphql.bitquery.io', { query })
      .toPromise();
    return data.data.ethereum.smartContractEvents;
  }

  async getLiquidity(pairAddress: string) {
    const query = poolBalance(pairAddress);
    const { data } = await this.httpService
      .post('https://graphql.bitquery.io', { query })
      .toPromise();
    return data.data.ethereum.address[0].balances;
  }

  async getPrice(pairAddress: string, baseSymbol: string, pairSymbol: string) {
    const balance = await this.getLiquidity(pairAddress);
    const baseBalance = balance.find(
      ({ currency }) => currency.symbol === baseSymbol,
    );
    const pairBalance = balance.find(
      ({ currency }) => currency.symbol === pairSymbol,
    );
    return baseBalance.value / pairBalance.value;
  }
}
