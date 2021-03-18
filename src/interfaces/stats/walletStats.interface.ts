import { LiteStatsI } from './liteStats.interface';

export interface WalletStatsI {
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
  pools?: LiteStatsI[];
  farms?: LiteStatsI[];
  incentivizedPools?: LiteStatsI[];
}
