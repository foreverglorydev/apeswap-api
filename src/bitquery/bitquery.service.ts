import { HttpService, Inject, Injectable } from '@nestjs/common';
import { tokenInformation } from 'src/stats/utils/subgraph.queries';

@Injectable()
export class BitqueryService {

  private readonly url: string;
  private readonly apiKey: string;

  constructor(
      @Inject(HttpService)
      private readonly httpService: HttpService,
  ) {
    this.url = process.env.BITQUERY_URL;
    this.apiKey = process.env.BITQUERY_APIKEY;
  }

  async getTokenInformation(baseToken: string, quoteCurrency: string) {

    return this.querySubraph(tokenInformation, `{
      "baseCurrency":"${baseToken}",
      "quoteCurrency":"${quoteCurrency}"
    }`)
  }

  private async querySubraph(query, variables = null): Promise<any> {
      
    const { data } = await this.httpService
      .post(this.url, { query, variables }, { headers : {"x-api-key": this.apiKey}})
      .toPromise()
      .catch(e => {
          console.log(e.response)
          return e.response;
      });
    return data;
  }
}