import { multicallNetwork } from 'src/utils/lib/multicall';
import { getBalanceNumber } from 'src/utils/math';
import { APE_PRICE_GETTER } from './abi/apePriceGetter';

export const fetchPrices = async (
  tokens,
  chainId,
  apePriceGetterAddress: string,
) => {
  const tokensToCall = tokens.filter(
    (token) => parseInt(token.chainId) === parseInt(chainId),
  );
  const calls = tokensToCall.map((token) => {
    if (token.lpToken) {
      return {
        address: apePriceGetterAddress,
        name: 'getLPPrice',
        params: [token.address, token.decimals],
      };
    }
    return {
      address: apePriceGetterAddress,
      name: 'getPrice',
      params: [token.address, token.decimals],
    };
  });
  const tokenPrices = await multicallNetwork(APE_PRICE_GETTER, calls, chainId);

  // Banana should always be the first token
  const mappedTokenPrices = tokensToCall.map((token, i) => {
    return {
      symbol: token.symbol,
      address: token.address.toLowerCase(),
      price:
        token.symbol === 'GNANA'
          ? getBalanceNumber(tokenPrices[0], token.decimals) * 1.389
          : getBalanceNumber(tokenPrices[i], token.decimals),
      decimals: token.decimals,
    };
  });
  return mappedTokenPrices;
};
