export class TokenDto {
  name?: string;
  address?: string;
  pooled_token?: number;
  price?: number;
}
export class QuoteTokenDto {
  network?: string;
  symbol?: string;
  address?: string;
}
export class PairInformationDto {
  ticker_id?: string;
  addressLP?: string;
  base?: TokenDto;
  target?: TokenDto;
  liquidity?: number;
  quote?: QuoteTokenDto;
  createdAt?: string;
}
