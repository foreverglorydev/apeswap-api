export class AddressStatsDto {
  address: string;
  position?: number;
  volume: number;
  prize: number;
}

export class SeasonInfoDto {
  season?: number;
  pair?: string;
  name?: string;
  startTimestamp?: string;
  endTimestamp?: string;
  finished?: boolean;
  rewards?: number;
}

export class TradingAllInfoDto {
  season: SeasonInfoDto;
  individual: AddressStatsDto;
  trading: any;
}
