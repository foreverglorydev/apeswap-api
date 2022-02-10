import { multicall } from "src/utils/lib/multicall"
import { getBalanceNumber } from "src/utils/math"
import { APE_PRICE_GETTER } from "./abi/apePriceGetter"
import { ERC20_ABI } from "./abi/erc20Abi"
import { apePriceGetter } from "./stats.utils"

export const fetchPrices = async (tokens, chainId) => {
    const apePriceGetterAddress = apePriceGetter(chainId)
    const tokensToCall = tokens.filter((token) => parseInt(token.chainId) === parseInt(chainId))
    const calls = tokensToCall.map((token, i) => {
        if (token.lpToken) {
            return {
                address: apePriceGetterAddress,
                name: 'getLPPrice',
                params: [token.address, token.decimals],
            }
        }
        return {
            address: apePriceGetterAddress,
            name: 'getPrice',
            params: [token.address, token.decimals],
        }
    })
    const tokenPrices = await multicall(APE_PRICE_GETTER, calls)

    // Banana should always be the first token
    const mappedTokenPrices = tokensToCall.map((token, i) => {
        return {
            symbol: token.symbol,
            address: token.address,
            price:
                token.symbol === 'GNANA'
                    ? getBalanceNumber(tokenPrices[0], token.decimals) * 1.389
                    : getBalanceNumber(tokenPrices[i], token.decimals),
            decimals: token.decimals,
        }
    })
    return mappedTokenPrices
}