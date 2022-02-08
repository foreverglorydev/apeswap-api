import { ApiHideProperty } from '@nestjs/swagger';
import { FarmStats } from './farm.dto';
import { IncentivizedPoolStats } from './incentivizedPool.dto';
import { PoolStats } from './pool.dto';

export class GeneralStats {
  readonly bananaPrice: number;
  readonly burntAmount: number;
  readonly totalSupply: number;
  readonly circulatingSupply: number;
  readonly marketCap: number;
  tvl: number;
  poolsTvl: number;

  @ApiHideProperty()
  readonly tvlInBnb?: number;
  totalLiquidity: number;
  totalVolume: number;
  pools: PoolStats[];
  farms: FarmStats[];
  incentivizedPools: IncentivizedPoolStats[];
}
