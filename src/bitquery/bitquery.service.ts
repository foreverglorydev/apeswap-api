import {
  CACHE_MANAGER,
  HttpService,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import {
  queryCandleData,
  queryPairInformation,
  queryPoolBalances,
  queryTokenInformation,
  queryTreasuryGnana,
  QUOTE_CURRENCY_BSC,
} from './bitquery.queries';
import { PairInformationDto } from './dto/pairInformation.dto';
import {
  PairBitquery,
  PairBitqueryDocument,
} from './schema/pairBitquery.schema';
import { TokenInformationDto } from './dto/tokenInformation.dto';
import {
  TokenBitquery,
  TokenBitqueryDocument,
} from './schema/tokenBitquery.schema';
import {
  calculatePrice,
  getQuoteCurrencies,
  getQuoteCurrency,
  updateAllPair,
  updatePair,
  verifyModel,
} from './utils/helper.bitquery';
import { CandleOptionsDto } from './dto/candle.dto';

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
    const pairModel = await this.pairBitqueryModel.findOne({ address });
    const verify = await verifyModel(pairModel);
    if (verify) return pairModel;
    if (!pairModel) {
      this.logger.log('Hit new calculate pair information');
      return await this.calculatePairInformation(address, network);
    } else {
      this.logger.log('Hit update calculate pair information');
      await updatePair(this.pairBitqueryModel, { address });
      this.calculatePairInformation(address, network);
    }

    return pairModel;
  }

  async calculatePairInformation(addressLP: string, network: string) {
    const pairInfo: PairInformationDto = {
      addressLP,
    };
    const {
      data: { ethereum },
    } = await this.queryBitquery(queryPairInformation(addressLP, network));
    if (ethereum.smartContractCalls) {
      const tokenFilters = ethereum.smartContractCalls.filter(
        (f) => f.smartContract?.contractType === 'Token',
      );
      pairInfo.quote = getQuoteCurrency(network);
      const {
        data: {
          ethereum: { address: balances, base, target },
        },
      } = await this.queryBitquery(
        queryPoolBalances(
          addressLP,
          network,
          tokenFilters[0].smartContract.address.address,
          tokenFilters[1].smartContract.address.address,
          pairInfo.quote.address,
        ),
      );
      pairInfo.base = {
        name: balances[0].balances[0].currency.symbol,
        address: balances[0].balances[0].currency.address,
        pooled_token: balances[0].balances[0].value,
      };
      pairInfo.target = {
        name: balances[0].balances[1].currency.symbol,
        address: balances[0].balances[1].currency.address,
        pooled_token: balances[0].balances[1].value,
      };
      pairInfo.ticker_id = `${pairInfo.base.name}_${pairInfo.target.name}`;
      const { basePrice, targetPrice } = calculatePrice(
        pairInfo,
        base,
        target,
        tokenFilters[0].smartContract.address.address,
      );
      pairInfo.base.price = basePrice;
      pairInfo.target.price = targetPrice;
      pairInfo.liquidity = pairInfo.base.pooled_token * 2 * pairInfo.base.price;
    }
    await updateAllPair(this.pairBitqueryModel, { addressLP }, pairInfo);
    await this.cacheManager.set(`pair-${addressLP}`, pairInfo, { ttl: 120 });
    return pairInfo;
  }

  async getTokenInformation(address: string, network: string) {
    const cachedValue = await this.cacheManager.get(`token-${address}`);
    if (cachedValue) {
      this.logger.log('Hit Query() cache');
      return cachedValue;
    }
    const tokenModel = await this.tokenBitqueryModel.findOne({ address });
    const verify = await verifyModel(tokenModel);
    if (verify) return tokenModel;
    if (!tokenModel) {
      this.logger.log('Hit new calculate token information');
      return await this.calculateTokenInformation(address, network);
    } else {
      this.logger.log('Hit update calculate token information');
      await updatePair(this.tokenBitqueryModel, { address });
      this.calculateTokenInformation(address, network);
    }

    return tokenModel;
  }

  async calculateTokenInformation(address: string, network: string) {
    const tokenInfo: TokenInformationDto = {
      address: address,
    };

    const { transfers, dexTrades, quote } = await this.calculateLastPrice(
      network,
      address,
    );

    if (transfers && transfers.length > 0) {
      tokenInfo.totalSupply = transfers[0].minted;
      tokenInfo.burntAmount = transfers[0].burned;
      tokenInfo.circulatingSupply = transfers[0].minted - transfers[0].burned;

      tokenInfo.name = transfers[0].currency.name;
      tokenInfo.symbol = transfers[0].currency.symbol;
    }

    if (dexTrades && dexTrades.length > 0) {
      tokenInfo.quote = quote;
      tokenInfo.tokenPrice = dexTrades[0].quotePrice;
      if (!tokenInfo.quote.stable) {
        const { dexTrades: dex } = await this.getQueryTokenInformation(
          network,
          tokenInfo.quote.address,
          getQuoteCurrency(network).address,
        );
        tokenInfo.tokenPrice *= dex[0].quotePrice;
      }
      tokenInfo.marketCap =
        (transfers[0].minted - transfers[0].burned) * tokenInfo.tokenPrice;
    }
    await updateAllPair(this.tokenBitqueryModel, { address }, tokenInfo);
    await this.cacheManager.set(`token-${address}`, tokenInfo, { ttl: 120 });

    return tokenInfo;
  }

  async calculateLastPrice(network: string, address: string) {
    let transfers, dexTrades, quote;
    const quotes = getQuoteCurrencies(network);
    for (let index = 0; index < Object.keys(quotes).length; index++) {
      const element = Object.values(quotes)[index];
      const {
        transfers: trans,
        dexTrades: dex,
      } = await this.getQueryTokenInformation(
        network,
        address,
        element.address,
      );
      if (dex && dex.length > 0) {
        const now = new Date().getTime();
        const time = dex[0].block.timestamp.unixtime;
        const diff = (now - time * 1000) / 1000 / 60;
        if (diff < 7200) {
          quote = element;
          transfers = trans;
          dexTrades = dex;
          break;
        }
      }
    }
    return { transfers, dexTrades, quote };
  }

  async getQueryTokenInformation(
    network: string,
    tokenAddress: string,
    quoteAddress: string,
  ) {
    const {
      data: {
        ethereum: { transfers, dexTrades },
      },
    } = await this.queryBitquery(
      queryTokenInformation(network, tokenAddress, quoteAddress),
    );

    return { transfers, dexTrades };
  }

  async getCandleToken(address: string, candleOptions: CandleOptionsDto) {
    const network = 'bsc';

    try {
      const {
        data: {
          ethereum: { dexTrades },
        },
      } = await this.queryBitquery(
        queryCandleData(
          address,
          QUOTE_CURRENCY_BSC.BUSD.address,
          network,
          candleOptions,
        ),
      );
      return dexTrades;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getTreasuryGnana(address: string) {
    const {
      data: {
        ethereum: { address: info },
      },
    } = await this.queryBitquery(queryTreasuryGnana(address));
    const { attributes } = info[0].smartContract;
    const circulatingSupply = attributes.find(
      (i) => i.name === 'bananaReserves',
    )?.value;
    const reserve = attributes.find((i) => i.name === 'goldenBananaReserves')
      ?.value;
    const supply = reserve + circulatingSupply;

    return { circulatingSupply, reserve, supply };
  }
  // bitquery
  async queryBitquery(query, variables = null): Promise<any> {
    const { data } = await this.httpService
      .post(
        this.url,
        { query, variables },
        { headers: { 'x-api-key': this.apiKey } },
      )
      .toPromise()
      .catch((e) => {
        console.log(e);
        return e.response;
      });
    return data;
  }
}
