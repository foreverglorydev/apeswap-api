import { ApiProperty } from "@nestjs/swagger";

export class FarmStats {
  @ApiProperty()
  readonly address: string;
  
  @ApiProperty()
  readonly name: string;
  
  @ApiProperty()
  readonly poolIndex: number;
  
  @ApiProperty()
  readonly t0Address: string;
  
  @ApiProperty()
  readonly t0Symbol: string;
  
  @ApiProperty()
  readonly t0Decimals: string;
  
  @ApiProperty()
  readonly p0: number;
  
  @ApiProperty()
  readonly q0: number;
  
  @ApiProperty()
  readonly t1Address: string;
  
  @ApiProperty()
  readonly t1Symbol: string;
  
  @ApiProperty()
  readonly t1Decimals: string;
  
  @ApiProperty()
  readonly p1: number;
  
  @ApiProperty()
  readonly q1: number;
  
  @ApiProperty()
  readonly price: number;
  
  @ApiProperty()
  readonly rewardTokenPrice: number;
  
  @ApiProperty()
  readonly rewardTokenSymbol: string;
  
  @ApiProperty()
  readonly totalSupply: number;
  
  @ApiProperty()
  readonly tvl: number;
  
  @ApiProperty()
  readonly stakedTvl: number;
  
  @ApiProperty()
  readonly apr: number;
  
  @ApiProperty()
  readonly decimals: string;
}
