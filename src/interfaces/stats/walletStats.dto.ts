import { LiteStats } from './liteStats.dto';

export interface WalletStats {
  tvl: number;
  bananaPrice: number;
  aggregateApr: number;
  aggregateAprPerDay: number;
  aggregateAprPerWeek: number;
  aggregateAprPerMonth: number;
  dollarsEarnedPerDay: number;
  dollarsEarnedPerWeek: number;
  dollarsEarnedPerMonth: number;
  dollarsEarnedPerYear: number;
  bananasEarnedPerDay: number;
  bananasEarnedPerWeek: number;
  bananasEarnedPerMonth: number;
  bananasEarnedPerYear: number;
  bananasInWallet: number;
  pendingReward?: number;
  pools?: LiteStats[];
  farms?: LiteStats[];
  incentivizedPools?: LiteStats[];
  pendingRewardUsd: number;
  pendingRewardBanana: number;
}
