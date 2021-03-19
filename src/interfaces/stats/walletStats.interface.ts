import { LiteStats } from './liteStats.interface';

export interface WalletStats {
  tvl: number;
  readonly bananaPrice: number;
  aggregateApr: number;
  aggregateAprPerDay: number;
  aggregateAprPerWeek: number;
  aggregateAprPerMonth: number;
  bananasEarnedPerDay: number;
  bananasEarnedPerWeek: number;
  bananasEarnedPerMonth: number;
  bananasEarnedPerYear: number;
  dollarsEarnedPerDay: number;
  dollarsEarnedPerWeek: number;
  dollarsEarnedPerMonth: number;
  dollarsEarnedPerYear: number;
  readonly bananasInWallet: number;
  pendingReward: number;
  pools?: LiteStats[];
  farms?: LiteStats[];
  incentivizedPools?: LiteStats[];
}
