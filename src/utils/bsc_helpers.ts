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
];

export async function getBscPrices(httpService) {
  return await lookUpPrices(httpService, bscTokens);
}

export async function loadMasterChefInfo(httpService) {
  return await lookUpPrices(httpService, bscTokens);
}
