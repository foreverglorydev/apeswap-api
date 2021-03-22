import { lookUpPrices } from 'src/utils/helpers';

const bscTokens = [
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
];

export async function getBscPrices(httpService) {
  return await lookUpPrices(httpService, bscTokens);
}
