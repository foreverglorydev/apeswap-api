const chunk = (arr, n) =>
  arr.length ? [arr.slice(0, n), ...chunk(arr.slice(n), n)] : [];

export async function lookUpPrices(httpService, token_array) {
  const prices = {};
  const pricePromises = [];

  for (const id_chunk of chunk(token_array, 50)) {
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
      for (const token of token_array) {
        if (data[token.id]) {
          prices[token.contract] = data[token.id];
        }
      }
    }
  });

  return prices;
}

export function getParameterCaseInsensitive(object, key) {
  return object[
    Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase())
  ];
}
