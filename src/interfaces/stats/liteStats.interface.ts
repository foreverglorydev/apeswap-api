export interface LiteStatsI {
  readonly address: string;
  readonly name: string;
  readonly stakedTvl: number;
  readonly pendingReward: number;
  readonly apr: number;
}
