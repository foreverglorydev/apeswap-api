import { ApiProperty } from '@nestjs/swagger';
import { FarmStats } from './farm.interface';
import { IncentivizedPoolStats } from './incentivizedPool.interface';
import { PoolStats } from './pool.interface';

export class GeneralStats {
  @ApiProperty()
  readonly bananaPrice: number;
  
  @ApiProperty()
  readonly burntAmount: number;
  
  @ApiProperty()
  readonly totalSupply: number;
  
  @ApiProperty()
  readonly circulatingSupply: number;
  
  @ApiProperty()
  readonly marketCap: number;
  
  @ApiProperty()
  tvl: number;
  
  @ApiProperty()
  poolsTvl: number;
  
  @ApiProperty()
  readonly tvlInBnb?: number;
  
  @ApiProperty()
  totalLiquidity: number;
  
  @ApiProperty()
  totalVolume: number;
  
  @ApiProperty({ type: () => [PoolStats] })
  pools: PoolStats[];
  
  @ApiProperty({ type: () => [FarmStats] })
  farms: FarmStats[];
  
  @ApiProperty({ type: () => [IncentivizedPoolStats] })
  incentivizedPools: IncentivizedPoolStats[];
}
