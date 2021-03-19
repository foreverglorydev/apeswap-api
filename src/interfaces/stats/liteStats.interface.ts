export interface LiteStats {
  readonly address: string;
  readonly name: string;
  readonly stakedTvl: number;
  readonly pendingReward: number;
  readonly pendingRewardUsd: number;
  readonly apr: number;
}
