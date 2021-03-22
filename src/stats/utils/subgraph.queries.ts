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
