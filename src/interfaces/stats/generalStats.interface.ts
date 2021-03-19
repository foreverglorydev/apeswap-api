import { FarmStats } from './farm.interface';
import { IncentivizedPoolStats } from './incentivizedPool.interface';
import { PoolStats } from './pool.interface';

export interface GeneralStats {
  readonly bananaPrice: number;
  readonly burntAmount: number;
  readonly totalSupply: number;
  readonly marketCap: number;
  tvl: number;
  readonly tvlInBnb?: number;
  readonly totalVolume: number;
  pools: PoolStats[];
  farms: FarmStats[];
  incentivizedPools: IncentivizedPoolStats[];
}
