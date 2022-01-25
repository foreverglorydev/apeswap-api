import { HttpService, Inject, Injectable } from '@nestjs/common';
import { Config } from './bitquery.module';

@Injectable()
export class BitqueryService {

  private readonly config: Config;
  private readonly httpService: HttpService;

  constructor(
      config: Config,
      @Inject(HttpService)
      httpService: HttpService,
  ) {
    this.config = config;
    this.httpService = httpService;
  }

  async querySubraph(query, variables = null): Promise<any> {
      
    const { data } = await this.httpService
      .post(this.config.url, { query, variables }, { headers : {"x-api-key": this.config.apiKey}})
      .toPromise()
      .catch(e => {
          console.log(e.response)
          return e.response;
      });
    return data;
  }
}