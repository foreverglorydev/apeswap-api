import { SOUL_POOL_ABI } from 'src/stats/utils/abi/soulBananaPoolAbi';
import { NUTS_BANANA_ABI } from 'src/stats/utils/abi/nutsBananaPoolAbi';

const chunk = (arr, n) =>
  arr.length ? [arr.slice(0, n), ...chunk(arr.slice(n), n)] : [];

export async function lookUpPrices(httpService, token_array) {
  const prices = {};

  for (const id_chunk of chunk(token_array, 50)) {
    const ids = id_chunk.map((x) => x.id).join('%2C');
    const url =
      'https://api.coingecko.com/api/v3/simple/price?ids=' +
      ids +
      '&vs_currencies=usd';
    const response = await httpService.get(url).toPromise();
    const data = response.data;
    for (const token of token_array) {
      if (data[token.id]) {
        prices[token.contract] = data[token.id];
      }
    }
  }
  return prices;
}

export function getParameterCaseInsensitive(object, key) {
  return object[
    Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase())
  ];
}

export const incentivizedPools = [
  {
    name: 'BANANA -> BNB Reward Pool',
    address: '0x0245c697a96045183048cdf18e9abae5b2237ff6',
    stakeToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    stakeTokenIsLp: false,
    rewardToken: 'BNB',
    rewardPerBlock: 694444400000000,
    startBlock: 5034880,
    endBlock: 5178877,
    abi: null,
  },
  {
    name: 'SOUL/BANANA LP -> SOUL Reward Pool',
    address: '0xf5Cb9F954D3Ea26Bb503A6996a4b2B0aAdC8c969',
    stakeToken: '0xa48271fF51900007D3b21Cecf30FDc8CCb63fEe6',
    stakeTokenIsLp: true,
    rewardToken: '0x67d012F731c23F0313CEA1186d0121779c77fcFE',
    rewardPerBlock: 135800000000,
    startBlock: 5511250,
    endBlock: 5604850,
    abi: SOUL_POOL_ABI,
  },
  {
    name: 'SOUL/BANANA LP -> SOUL Reward Pool',
    address: '0x82576dB7685418CBDD5A9f4721D605C125E4569c',
    stakeToken: '0xa48271fF51900007D3b21Cecf30FDc8CCb63fEe6',
    stakeTokenIsLp: true,
    rewardToken: '0x67d012F731c23F0313CEA1186d0121779c77fcFE',
    rewardPerBlock: 39600000000,
    startBlock: 5602450,
    endBlock: 5804050,
    abi: SOUL_POOL_ABI,
  },
  {
    name: 'NUTS/BANANA LP -> NUTS Reward Pool',
    address: '0x3523cE00C9f82FfafC850C0Acccb78341239028b',
    stakeToken: '0x44Baf117d79D5313BeA1fBBA416E4067436E4bBE',
    stakeTokenIsLp: true,
    rewardToken: '0x8893D5fA71389673C5c4b9b3cb4EE1ba71207556',
    rewardPerBlock: 86805555560000000,
    startBlock: 5629403,
    endBlock: 5658203,
    abi: NUTS_BANANA_ABI,
  },
  {
    name: 'NUTS/BANANA LP -> BANANA Reward Pool',
    address: '0xdb28A11Fe950C9979A8050E6cBA76D187D5C3b70',
    stakeToken: '0x44Baf117d79D5313BeA1fBBA416E4067436E4bBE',
    stakeTokenIsLp: true,
    rewardToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    rewardPerBlock: 144652777800000000,
    startBlock: 5658203,
    endBlock: 5687003,
    abi: NUTS_BANANA_ABI,
  },
  {
    name: 'CRX/BANANA LP -> CRX Reward Pool',
    address: '0x084beaa501dB448869001BA49913c9aD009b1694',
    stakeToken: '0xbD896f59BAf9A624A7587DE5D28B7aD3459342bA',
    stakeTokenIsLp: true,
    rewardToken: '0x97a30C692eCe9C317235d48287d23d358170FC40',
    rewardPerBlock: 2604166666667000,
    startBlock: 5682212,
    endBlock: 5826212,
    abi: NUTS_BANANA_ABI,
  },
  {
    name: 'NAUT/BNB LP -> NAUT Reward Pool',
    address: '0x114d54e18eb4A7Dc9bB8280e283E5799D4188E3f',
    stakeToken: '0x288EA5437c7aaD045a393cee2F41E548df24d1C8',
    stakeTokenIsLp: true,
    rewardToken: '0x05B339B0A346bF01f851ddE47a5d485c34FE220c',
    rewardPerBlock: '28935185',
    startingBlock: 5720710,
    endingBlock: 6584710,
    abi: NUTS_BANANA_ABI,
  },
  {
    name: 'NUTS/BANANA LP -> NUTZ Reward Pool',
    address: '0x6Fd37f3F83F11100f9f501e2690E96F6fAC37E94',
    stakeToken: '0x44Baf117d79D5313BeA1fBBA416E4067436E4bBE',
    stakeTokenIsLp: true,
    rewardToken: '0x8893D5fA71389673C5c4b9b3cb4EE1ba71207556',
    rewardPerBlock: '24965277777778000',
    startingBlock: 5744527,
    endingBlock: 5946127,
    abi: NUTS_BANANA_ABI,
  },
];

export const tokenType = {
  '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95': 'bep20', //BANANA
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': 'bep20', //WBNB
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': 'bep20', //BUSD
  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c': 'bep20', //BTCB
  '0x2170Ed0880ac9A755fd29B2688956BD959F933F8': 'bep20', //ETH
  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82': 'bep20', //CAKE
  '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5': 'bep20', //BAKE
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 'bep20', //USDC
  '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713': 'lp',
  '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914': 'lp',
  '0x51e6D27FA57373d8d4C256231241053a70Cb1d93': 'lp',
  '0x1E1aFE9D9c5f290d8F6996dDB190bd111908A43D': 'lp',
  '0xA0C3Ef24414ED9C9B456740128d8E63D016A9e11': 'lp',
  '0x51bB531A5253837A23cE8de478a4941A71A4202C': 'lp',
  '0x9949E1DB416a8a05A0cAC0bA6Ea152ba8729e893': 'lp',
};
