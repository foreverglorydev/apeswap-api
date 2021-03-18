export interface IncentivizedPoolI {
  readonly address: string;
  readonly stakedTokenAddress: string;
  readonly stakedTokenSymbol: string;
  readonly t0Address: string;
  readonly t0Symbol: string;
  readonly p0: number;
  readonly q0: number;
  readonly t1Address: string;
  readonly t1Symbol: string;
  readonly p1: number;
  readonly q1: number;
  readonly totalSupply: number;
  readonly stakedSupply: number;
  decimals?: string;
  readonly tvl: number;
  readonly stakedTvl: number;
  readonly apr: number;
  readonly rewardTokenPrice: number;
  readonly rewardTokenSymbol: string;
  readonly price: number;
  abi: any;
}
