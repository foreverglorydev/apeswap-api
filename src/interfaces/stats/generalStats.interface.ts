import { FarmI } from './farm.interface';
import { IncentivizedPoolI } from './incentivizedPool.interface';
import { PoolI } from './pool.interface';

export interface GeneralStatsI {
  readonly bananaPrice: number;
  readonly burntAmount: number;
  readonly totalSupply: number;
  readonly marketCap: number;
  readonly tvl: number;
  readonly tvlInBnb: number;
  readonly totalVolume: number;
  pools: PoolI[];
  farms: FarmI[];
  incentivizedPools: IncentivizedPoolI[];
}
