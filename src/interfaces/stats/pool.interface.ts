export interface PoolStats {
  readonly address: string;
  readonly apr: number;
  readonly decimals: string;
  readonly lpSymbol: string;
  readonly name: string;
  readonly poolIndex: number;
  readonly price: number;
  readonly staked: number;
  readonly stakedTvl: number;
  readonly tvl: number;
}
