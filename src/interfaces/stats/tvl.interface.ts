export interface StatsChain {
  tvl: number;
  totalLiquidity: number;
  totalVolume: number;
}

export interface GeneralStatsChain {
  tvl: number;
  totalLiquidity: number;
  totalVolume: number;
  bsc: StatsChain;
  polygon: StatsChain;
  burntAmount: number;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  gnanaCirculatingSupply: number;
}
