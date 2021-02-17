export class GetCandleDataDto {
  symbol: string;
  token: string;
  base: string;
  address: string;
  resolution: number;
  from: number;
  to: number;
}
