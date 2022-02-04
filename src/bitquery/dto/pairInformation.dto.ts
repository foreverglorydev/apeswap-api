export class Token {
  name?: string;
  address?: string;
  pooled_token?: number;
  price?: number;
}
export class QuoteToken {
  network?: string;
  symbol?: string;
  address?: string;
}
export class PairInformation {
  ticker_id?: string;
  addressLP?: string;
  base?: Token;
  target?: Token;
  liquidity?: number;
  quote?: QuoteToken;
  createdAt?: string;
}
