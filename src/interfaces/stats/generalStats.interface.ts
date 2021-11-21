import { FarmStats } from './farm.interface';
import { IncentivizedPoolStats } from './incentivizedPool.interface';
import { PoolStats } from './pool.interface';

export interface GeneralStats {
  readonly bananaPrice: number;
  readonly burntAmount: number;
  readonly totalSupply: number;
  readonly circulatingSupply: number;
  readonly marketCap: number;
  tvl: number;
  poolsTvl: number;
  readonly tvlInBnb?: number;
  totalLiquidity: number;
  totalVolume: number;
  pools: PoolStats[];
  farms: FarmStats[];
  incentivizedPools: IncentivizedPoolStats[];
}
