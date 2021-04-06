export function liquidityQuery() {
  return `{
      uniswapFactory(id: "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6") {
        id
        totalVolumeUSD
        totalLiquidityUSD
        totalLiquidityETH
      }
    }`;
}

export const pairsQuery = `{
  pairs {
    id
    token0 {
      id
      symbol
      derivedBNB: derivedETH
			tradeVolumeUSD
    }
    token1 {
      id
      symbol
      derivedBNB: derivedETH
			tradeVolumeUSD
    }
    token0Price
    token1Price
    reserve0
    reserve1
    volumeUSD
    totalSupply
    derivedBNB: reserveETH
  }
}`;

export function dayData(skip: number, startTime: number, endTime: number) {
  return `{
    apeswapDayDatas: uniswapDayDatas(first: 1000, skip: ${skip}, where: { date_gt: ${startTime}, date_lt: ${endTime} }, orderBy: date, orderDirection: desc) {
      id
      date
      totalVolumeUSD
      dailyVolumeUSD
      dailyVolumeBNB: dailyVolumeETH
      totalLiquidityUSD
      totalLiquidityBNB: totalLiquidityETH
    }
  }`;
}

export const allPricesQuery = `{
  tokens {
    id
    symbol
    name
    derivedBNB: derivedETH
    tokenDayData(orderBy: date orderDirection: desc, first: 1) {
      id
      dailyTxns
      priceUSD
    }
  }
}`;