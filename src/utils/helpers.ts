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
