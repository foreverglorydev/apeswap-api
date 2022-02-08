import { ApiHideProperty } from '@nestjs/swagger';

export class IncentivizedPoolStats {
  readonly id: number;
  readonly name: string;
  readonly address: string;
  readonly active: boolean;
  readonly blocksRemaining: number;
  readonly stakedTokenAddress: string;
  readonly rewardTokenAddress: string;
  @ApiHideProperty()
  t0Address?: string;
  @ApiHideProperty()
  t0Symbol?: string;
  @ApiHideProperty()
  p0?: number;
  @ApiHideProperty()
  q0?: number;
  @ApiHideProperty()
  t1Address?: string;
  @ApiHideProperty()
  t1Symbol?: string;
  @ApiHideProperty()
  p1?: number;
  @ApiHideProperty()
  q1?: number;
  readonly totalSupply: number;
  readonly stakedSupply: number;
  readonly rewardDecimals: number;
  readonly stakedTokenDecimals: number;
  readonly tvl: number;
  readonly stakedTvl: number;
  readonly apr: number;
  readonly rewardTokenPrice: number;
  readonly rewardTokenSymbol: string;
  readonly price: number;
  @ApiHideProperty()
  abi: any;
}
