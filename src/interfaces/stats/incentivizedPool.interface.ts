import { ApiProperty } from "@nestjs/swagger";

export class IncentivizedPoolStats {
  @ApiProperty()
  readonly id: number;
  
  @ApiProperty()
  readonly name: string;
  
  @ApiProperty()
  readonly address: string;
  
  @ApiProperty()
  readonly active: boolean;
  
  @ApiProperty()
  readonly blocksRemaining: number;
  
  @ApiProperty()
  readonly stakedTokenAddress: string;
  
  @ApiProperty()
  t0Address?: string;
  
  @ApiProperty()
  t0Symbol?: string;
  
  @ApiProperty()
  p0?: number;
  
  @ApiProperty()
  q0?: number;
  
  @ApiProperty()
  t1Address?: string;
  
  @ApiProperty()
  t1Symbol?: string;
  
  @ApiProperty()
  p1?: number;
  
  @ApiProperty()
  q1?: number;
  
  @ApiProperty()
  readonly totalSupply: number;
  
  @ApiProperty()
  readonly stakedSupply: number;
  
  @ApiProperty()
  readonly rewardDecimals: string;
  
  @ApiProperty()
  readonly stakedTokenDecimals: string;
  
  @ApiProperty()
  readonly tvl: number;
  
  @ApiProperty()
  readonly stakedTvl: number;
  
  @ApiProperty()
  readonly apr: number;
  
  @ApiProperty()
  readonly rewardTokenPrice: number;
  
  @ApiProperty()
  readonly rewardTokenSymbol: string;
  
  @ApiProperty()
  readonly price: number;
  
  @ApiProperty()
  abi: any;
}
