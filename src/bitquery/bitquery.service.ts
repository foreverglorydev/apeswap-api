import { CACHE_MANAGER, HttpService, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { queryPairInformation, queryPoolBalances, QUOTE_CURRENCY_BUSD, QUOTE_CURRENCY_USDT, tokenInformation } from './bitquery.queries';
import { PairInformation } from './dto/pairInformation.dto';
import { PairBitquery, PairBitqueryDocument } from './schema/pairBitquery.schema';

@Injectable()
export class BitqueryService {

  private readonly logger = new Logger(BitqueryService.name);
  private readonly url: string;
  private readonly apiKey: string;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(HttpService)
    private readonly httpService: HttpService,
    @InjectModel(PairBitquery.name)
    private pairBitqueryModel: Model<PairBitqueryDocument>,
  ) {
    this.url = process.env.BITQUERY_URL;
    this.apiKey = process.env.BITQUERY_APIKEY;
  }

  async getPairInformation(address: string, network: string) {

    const cachedValue = await this.cacheManager.get(`pair-${address}`);
      if (cachedValue) {
        this.logger.log('Hit getPairInformation() cache');
        return cachedValue;
    }
    let pairModel = await this.verifyPair(address);
    if (pairModel) return pairModel;
    pairModel = await this.findPair({ address });
    if(!pairModel) {
      this.logger.log('Hit new calculate pair information');
      pairModel = await this.calculatePairInformation(address, network);
      await this.pairBitqueryModel.create(pairModel);
    }else{
      await this.updatePair({address});
      this.logger.log('Hit update calculate pair information');
      this.calculatePairInformation(address, network);
    }
    return pairModel;
  }

  async calculatePairInformation(address: string, network: string) {
    const pairInfo: PairInformation = {
      address
    }
    const date = new Date();
    const fullDate = `${date.getFullYear()}-${date.getMonth()}1-${date.getDate()}`
    const { data: { ethereum } } = await this.queryBitquery(queryPairInformation(
      address,
      network,
      fullDate,
      `${fullDate}T23:59:59`,
    ))
    if (ethereum.smartContractCalls) {
      const tokenFilters = ethereum.smartContractCalls.filter(f => f.smartContract?.contractType === 'Token')
      const quoteCurrency = network === 'bsc' ? QUOTE_CURRENCY_BUSD : QUOTE_CURRENCY_USDT;
      pairInfo.base = tokenFilters[0].smartContract.currency.symbol;
      pairInfo.target = tokenFilters[1].smartContract.currency.symbol;
      pairInfo.base_address = tokenFilters[0].smartContract.address.address;
      pairInfo.target_address = tokenFilters[1].smartContract.address.address;
      pairInfo.ticker_id = `${pairInfo.base}_${pairInfo.target}`
      const { data: { ethereum: { address: balances, dexTrades } } } = await this.queryBitquery(queryPoolBalances(address, pairInfo.base_address, network, quoteCurrency));
      pairInfo.amount = balances[0].balances[0].value;
      pairInfo.quote_currency_address = quoteCurrency;
      pairInfo.price = dexTrades[0].quotePrice;
      pairInfo.value_usd = pairInfo.amount * 2 * dexTrades[0].quotePrice;
    }
    const newPair = await this.updateAllPair({address},pairInfo);
    await this.cacheManager.set(`pair-${address}`, newPair, { ttl: 120 });
    return pairInfo;
  }

  async getTokenInformation(baseToken: string, quoteCurrency: string) {

    return this.queryBitquery(tokenInformation, `{
      "baseCurrency":"${baseToken}",
      "quoteCurrency":"${quoteCurrency}"
    }`)
  }

  private async queryBitquery(query, variables = null): Promise<any> {

    const { data } = await this.httpService
      .post(this.url, { query, variables }, { headers: { "x-api-key": this.apiKey } })
      .toPromise();
    return data;
  }

  async verifyPair(address) {
    const now = Date.now();
    const pair: any = await this.findPair({address})
    if (!pair?.createdAt) return null;

    const lastCreatedAt = new Date(pair.createdAt).getTime();
    const diff = now - lastCreatedAt;
    const time = 120000; // 2 minutes

    if (diff > time) return null;

    return pair;
  }

  updateAllPair(filter, pair) {
    return this.pairBitqueryModel.updateOne(
      filter,
      {
        $set: pair,
        $currentDate: {
          createdAt: true,
        },
      },
      {
        upsert: true,
        timestamps: true,
      },
    );
  }

  findPair(filter) {
    return this.pairBitqueryModel.findOne(filter);
  }

  updatePair(filter) {
    return this.pairBitqueryModel.updateOne(
      filter,
      {
        $currentDate: {
          createdAt: true,
        },
      },
    );
  }
}