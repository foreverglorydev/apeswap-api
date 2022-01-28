import { CACHE_MANAGER, HttpService, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { queryPairInformation, queryPoolBalances, queryTokenInformation, QUOTE_CURRENCY_BUSD, QUOTE_CURRENCY_USDT } from './bitquery.queries';
import { PairInformation } from './dto/pairInformation.dto';
import { PairBitquery, PairBitqueryDocument } from './schema/pairBitquery.schema';
import { TokenInformation } from './dto/tokenInformation.dto';
import { TokenBitquery, TokenBitqueryDocument } from './schema/tokenBitquery.schema';

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
    public pairBitqueryModel: Model<PairBitqueryDocument>,
    @InjectModel(TokenBitquery.name)
    public tokenBitqueryModel: Model<TokenBitqueryDocument>,
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
    let pairModel = await this.pairBitqueryModel.findOne({address});
    const verify = await this.verifyModel(pairModel);
    if (verify) return pairModel;
    if(!pairModel) {
      this.logger.log('Hit new calculate pair information');
      return await this.calculatePairInformation(address, network);
    }else{
      this.logger.log('Hit update calculate pair information');
      await this.updatePair(this.pairBitqueryModel, {address});
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
    await this.updateAllPair(this.pairBitqueryModel, {address}, pairInfo);
    await this.cacheManager.set(`pair-${address}`, pairInfo, { ttl: 120 });
    return pairInfo;
  }

  async getTokenInformation(address: string, network: string) {

    const cachedValue = await this.cacheManager.get(`token-${address}`);
      if (cachedValue) {
        this.logger.log('Hit getTokenInformation() cache');
        return cachedValue;
    }
    let tokenModel = await this.tokenBitqueryModel.findOne({address});
    const verify = await this.verifyModel(tokenModel);
    if (verify) return tokenModel;
    if(!tokenModel) {
      this.logger.log('Hit new calculate token information');
      return await this.calculateTokenInformation(address, network);
    }else{
      this.logger.log('Hit update calculate token information');
      await this.updatePair(this.tokenBitqueryModel, {address});
      this.calculateTokenInformation(address, network);
    }

    return tokenModel;
    
  }

  async calculateTokenInformation(address: string, network: string) {
    const tokenInfo: TokenInformation = {};
    const quoteCurrency = network === 'bsc' ? QUOTE_CURRENCY_BUSD : QUOTE_CURRENCY_USDT;
    const { data: { ethereum: { transfers, dexTrades} }} = await this.queryBitquery(queryTokenInformation(network, address, quoteCurrency));
    tokenInfo.tokenPrice = dexTrades[0].quotePrice; 
    tokenInfo.totalSupply = transfers[0].minted; 
    tokenInfo.burntAmount = transfers[0].burned; 
    tokenInfo.circulatingSupply = transfers[0].minted - transfers[0].burned; 
    tokenInfo.marketCap = (transfers[0].minted - transfers[0].burned) * dexTrades[0].quotePrice;
    tokenInfo.address = address;
    await this.updateAllPair(this.tokenBitqueryModel, {address}, tokenInfo);
    await this.cacheManager.set(`token-${address}`, tokenInfo, { ttl: 120 });

    return {...tokenInfo, ...transfers[0].currency};
  }

  private async queryBitquery(query, variables = null): Promise<any> {

    const { data } = await this.httpService
      .post(this.url, { query, variables }, { headers: { "x-api-key": this.apiKey } })
      .toPromise();
    return data;
  }

  async verifyModel(model) {
    if(!model) return null;
    const now = Date.now();
    const lastCreatedAt = new Date(model.createdAt).getTime();
    const diff = now - lastCreatedAt;
    const time = 120000; // 2 minutes

    if (diff > time) return null;

    return model;
  }

  updateAllPair(modul, filter, pair) {
    return modul.updateOne(
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

  updatePair(modul, filter) {
    return modul.updateOne(
      filter,
      {
        $currentDate: {
          createdAt: true,
        },
      },
    );
  }
}