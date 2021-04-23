import { Injectable, HttpService } from '@nestjs/common';
import { chunk } from 'lodash';
import { SubgraphService } from './subgraph.service';

@Injectable()
export class PriceService {
  constructor(
    private httpService: HttpService,
    private subgraphService: SubgraphService,
  ) {}

  async getTokenPrices(): Promise<any> {
    const prices = {};
    const data = await this.subgraphService.getAllPriceData();
    const pricesGecko = await this.getCoinGeckoPrices(); // coinGeckoPrice price feed
    
    
    for (let i = 0; i < data.length; i++) {
      if (data[i].tokenDayData.length > 0) {
        prices[data[i].id] = {
          usd: data[i].tokenDayData[0].priceUSD,
        };
      }
    }

    return Object.assign(prices, pricesGecko);
  }

  async getCoinGeckoPrices() {
    const prices = {};
    const pricePromises = [];

    for (const id_chunk of chunk(this.coinGeckoTokens, 50)) {
      const ids = id_chunk.map((x) => x.id).join('%2C');
      const url =
        'https://api.coingecko.com/api/v3/simple/price?ids=' +
        ids +
        '&vs_currencies=usd';
      pricePromises.push(this.httpService.get(url).toPromise());
    }

    await Promise.all(pricePromises).then((priceArray) => {
      for (let i = 0; i < priceArray.length; i++) {
        const data = priceArray[i].data;
        for (const token of this.coinGeckoTokens) {
          if (data[token.id]) {
            prices[token.contract] = data[token.id];
          }
        }
      }
    });
    
    return prices;
  }

  coinGeckoTokens = [
    {
      id: 'wbnb',
      symbol: 'wbnb',
      contract: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    },
    {
      id: 'binance-usd',
      symbol: 'busd',
      contract: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    },
    {
      id: 'pancakeswap-token',
      symbol: 'CAKE',
      contract: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    },
    {
      id: 'bakerytoken',
      symbol: 'BAKE',
      contract: '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
    },
    {
      id: 'usd-coin',
      symbol: 'USDC',
      contract: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    },
    {
      id: 'apoyield',
      symbol: 'SOUL',
      contract: '0x67d012f731c23f0313cea1186d0121779c77fcfe',
    },
    {
      id: 'sushi',
      symbol: 'SUSHI',
      contract: '0x947950BcC74888a40Ffa2593C5798F11Fc9124C4',
    },
    {
      id: 'iota',
      symbol: 'IOTA',
      contract: '0xd944f1d1e9d5f9bb90b62f9d45e447d989580782',
    },
    {
      id: 'polkadot',
      symbol: 'DOT',
      contract: '0x7083609fce4d1d8dc0c979aab8c869ea2c873402',
    },
    {
      id: 'ripple',
      symbol: 'XRP',
      contract: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe',
    },
    {
      id: 'chainlink',
      symbol: 'LINK',
      contract: '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',
    },
    {
      id: 'tether',
      symbol: 'USDT',
      contract: '0x55d398326f99059ff775485246999027b3197955',
    },
    {
      id: 'swipe',
      symbol: 'SXP',
      contract: '0x47bead2563dcbf3bf2c9407fea4dc236faba485a',
    },
  ];
}
