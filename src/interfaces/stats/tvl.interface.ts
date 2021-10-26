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
}
