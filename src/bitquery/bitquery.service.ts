import { HttpService, Inject, Injectable } from '@nestjs/common';
import { queryPairInformation, queryPoolBalances, QUOTE_CURRENCY_BUSD, QUOTE_CURRENCY_USDT, tokenInformation } from './bitquery.queries';
import { PairInformation } from './dto/pairInformation.dto';

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

  async getPairInformation(address: string, network: string) {

    const pairInfo: PairInformation = {
      address
    }
    const date = new Date();
    const fullDate = `${date.getFullYear()}-${date.getMonth()}1-${date.getDate()}`
    const { data: { ethereum } } = await this.querySubraph(queryPairInformation(
      address,
      network,
      fullDate,
      `${fullDate}T23:59:59`,
    ))
    if(ethereum.smartContractCalls) {
      const tokenFilters = ethereum.smartContractCalls.filter( f => f.smartContract?.contractType === 'Token')
      const quoteCurrency = network === 'bsc' ? QUOTE_CURRENCY_BUSD : QUOTE_CURRENCY_USDT;
      pairInfo.base = tokenFilters[0].smartContract.currency.symbol;
      pairInfo.target = tokenFilters[1].smartContract.currency.symbol;
      pairInfo.base_address = tokenFilters[0].smartContract.address.address;
      pairInfo.target_address = tokenFilters[1].smartContract.address.address;
      pairInfo.ticker_id = `${pairInfo.base}_${pairInfo.target}`
      const { data: { ethereum: { address : balances , dexTrades }}} = await this.querySubraph(queryPoolBalances(address, pairInfo.base_address, network, quoteCurrency));
      pairInfo.amount = balances[0].balances[0].value;
      pairInfo.quote_currency_address = quoteCurrency;
      pairInfo.price = dexTrades[0].quotePrice;
      pairInfo.value_usd = pairInfo.amount * 2 * dexTrades[0].quotePrice;
    }

    return pairInfo;
    
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
      .toPromise();
    return data;
  }
}