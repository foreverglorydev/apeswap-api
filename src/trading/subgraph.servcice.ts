import { Injectable, HttpService } from '@nestjs/common';
import { tradeData } from './utils/subgraph.queries';

@Injectable()
export class SubgraphService {
  graphUrl =
    'https://graph.apeswap.finance/subgraphs/name/ape-swap/apeswap-subgraph';
  constructor(private httpService: HttpService) {}

  async getTradeData(): Promise<any> {
    const { data } = await this.querySubraph(tradeData);
    return data;
  }

  async querySubraph(query): Promise<any> {
    const { data } = await this.httpService
      .post(this.graphUrl, { query })
      .toPromise();
    return data;
  }
}
