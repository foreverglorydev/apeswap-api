export interface LiteStats {
  readonly address: string;
  readonly name: string;
  readonly stakedTvl: number;
  readonly pendingReward: number;
  readonly pendingRewardUsd: number;
  readonly apr: number;
  readonly dollarsEarnedPerDay: number;
  readonly dollarsEarnedPerWeek: number;
  readonly dollarsEarnedPerMonth: number;
  readonly dollarsEarnedPerYear: number;
  readonly tokensEarnedPerDay: number;
  readonly tokensEarnedPerWeek: number;
  readonly tokensEarnedPerMonth: number;
  readonly tokensEarnedPerYear: number;
}
