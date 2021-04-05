import { Injectable, HttpService } from '@nestjs/common';
@Injectable()
export class PriceService {
  constructor(private httpService: HttpService) {}

  async getTokenPrices(): Promise<any> {
    const prices = await this.getCoinGeckoPrices(this.httpService);
    return prices;
  }

  async getCoinGeckoPrices(httpService) {
    const prices = {};
    const pricePromises = [];

    for (const id_chunk of this.chunk(this.coinGeckoTokens, 50)) {
      const ids = id_chunk.map((x) => x.id).join('%2C');
      const url =
        'https://api.coingecko.com/api/v3/simple/price?ids=' +
        ids +
        '&vs_currencies=usd';
      pricePromises.push(httpService.get(url).toPromise());
    }

    Promise.all(pricePromises).then((priceArray) => {
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

  chunk(arr, n) {
    return arr.length ? [arr.slice(0, n), ...this.chunk(arr.slice(n), n)] : [];
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
  ];
}
