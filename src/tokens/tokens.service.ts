/*
  TODO
  - Update strapi endpoing to have start and end times
  - Add sources to get token lists instead of fixed config
  - Get things working on Polygon side (web3 config seems to be just for 1 chain)
  - Make cron jobs for all
  - Improve efficiency and cleanliness of code (less for loops)
  - Add basic error handling
*/

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubgraphService } from '../stats/subgraph.service';
import { TokenList, TokenListDocument } from './schema/tokenList.schema';
import { tokenListConfig } from './tokens.config';
import { getWeb3 } from 'src/utils/lib/web3';
import { Token } from 'src/interfaces/tokens/token.dto';
import { getTokenLogoUrl } from './utils/tokens.utils';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(
    @InjectModel(TokenList.name)
    private tokenListModel: Model<TokenListDocument>,
    private subgraphService: SubgraphService,
  ) {}

  web3 = getWeb3();

  /*
    FUNCTIONS CALLED BY THE CONTROLLER
  */

  // Called at /tokens
  async getAllTokens(): Promise<TokenList[]> {
    const tokenLists: TokenList[] = await this.findAllTokenLists();

    return tokenLists;
  }

  // Called at /tokens/:type
  async getTokensFromType(type: string): Promise<TokenList> {
    const tokenList: TokenList = await this.findTokenList(type);

    // TEMPORARY: The /tokens/type endpoint will trigger what will later become the cronjob
    const processedTokens: Token[] = await this.processTokensFromSubgraphData();

    return tokenList;
  }

  /* 
    CRONJOB PROCESSOR
  */
  async processTokensFromSubgraphData(): Promise<any> {
    // 1. Get raw token data from subgraph
    const {
      currentTokenData,
      previousTokenData,
    } = await this.getRawTokenDataFromSubgraph(56);

    // 2. Filter raw token data into data for the database
    const filteredTokenData = await this.prepDataForDatabase(
      currentTokenData,
      previousTokenData,
    );

    const tokenStorageResponse = await this.createTokenList({
      title: 'all-bnb',
      tokens: filteredTokenData,
    });

    // 3. Store the individual token lists in the database
    tokenListConfig.forEach(async (tokenList) => {
      const { type, chainId, tokens } = tokenList;

      // If BNB CHain, filter the tokens in the config vs all the top 100 tokens
      if (chainId === 56) {
        const applicableTokens = [];
        for (let i = 0; i < tokens.length; i++) {
          for (let j = 0; j < filteredTokenData.length; j++) {
            if (
              tokens[i].toLowerCase() ===
              filteredTokenData[j].contractAddress.toLowerCase()
            ) {
              applicableTokens.push(filteredTokenData[j]);
            }
          }
        }

        // Store the individual token lists as documents in the DB
        await this.createTokenList({
          title: type,
          tokens: applicableTokens,
        });
      }
    });

    return tokenStorageResponse;
  }

  /*
    SUBGRAPH FUNCTIONALITY
  */
  // TODO: Update to handle polygon
  async getRawTokenDataFromSubgraph(chainId: number): Promise<any> {
    const yesterdayBlock: number =
      (await this.web3.eth.getBlockNumber()) - 28800;

    const currentTokenData = await this.subgraphService.getTopTokensData(
      chainId,
      'now',
    );
    const previousTokenData = await this.subgraphService.getTopTokensData(
      chainId,
      yesterdayBlock.toString(),
    );

    return {
      currentTokenData: currentTokenData.tokens,
      previousTokenData: previousTokenData.tokens,
    };
  }

  /*
    FILTER FUNCTIONALITY
  */
  async prepDataForDatabase(
    currentTokenData: any,
    previousTokenData: any,
  ): Promise<any> {
    const tokens: Token[] = [];

    // Loop through current tokens and previous tokens to get the appropriate data for storing info in the DB
    for (let i = 0; i < currentTokenData.length; i++) {
      const { id, symbol, tokenDayData } = currentTokenData[i];
      for (let j = 0; j < previousTokenData.length; j++) {
        if (id === previousTokenData[j].id) {
          const currentPrice = parseFloat(tokenDayData[0].priceUSD);
          const previousPrice = parseFloat(
            previousTokenData[j].tokenDayData[0].priceUSD,
          );
          const percentageChange =
            (currentPrice - previousPrice) / previousPrice;

          const logoUrl = await getTokenLogoUrl(id);

          tokens.push({
            tokenTicker: symbol,
            tokenPrice: currentPrice,
            percentChange: percentageChange,
            contractAddress: id,
            logoUrl,
          });
        }
      }
    }

    return tokens;
  }

  /* 
    DATABASE FUNCTIONALITY
  */
  createTokenList(tokenList: any) {
    return this.tokenListModel.updateOne(
      { title: tokenList.title },
      {
        $set: tokenList,
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

  findTokenList(type: string) {
    return this.tokenListModel.findOne({ title: type });
  }

  findAllTokenLists() {
    return this.tokenListModel.find();
  }
}
