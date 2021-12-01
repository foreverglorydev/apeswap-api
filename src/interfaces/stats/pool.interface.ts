import { ApiProperty } from "@nestjs/swagger";

export class PoolStats {
  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly apr: number;

  @ApiProperty()
  readonly decimals: string;

  @ApiProperty()
  readonly lpSymbol: string;

  @ApiProperty()
  readonly poolIndex: number;

  @ApiProperty()
  readonly price: number;

  @ApiProperty()
  readonly rewardTokenPrice: number;

  @ApiProperty()
  readonly rewardTokenSymbol: string;

  @ApiProperty()
  readonly staked: number;

  @ApiProperty()
  readonly stakedTvl: number;

  @ApiProperty()
  readonly tvl: number;
}
