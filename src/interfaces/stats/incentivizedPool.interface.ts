export class IncentivizedPoolStats {
  readonly id: number;
  readonly name: string;
  readonly address: string;
  readonly active: boolean;
  readonly blocksRemaining: number;
  readonly stakedTokenAddress: string;
  t0Address?: string;
  t0Symbol?: string;
  p0?: number;
  q0?: number;
  t1Address?: string;
  t1Symbol?: string;
  p1?: number;
  q1?: number;
  readonly totalSupply: number;
  readonly stakedSupply: number;
  readonly rewardDecimals: string;
  readonly stakedTokenDecimals: string;
  readonly tvl: number;
  readonly stakedTvl: number;
  readonly apr: number;
  readonly rewardTokenPrice: number;
  readonly rewardTokenSymbol: string;
  readonly price: number;
  abi: any;
}
