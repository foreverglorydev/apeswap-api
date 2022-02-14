class CurrencyDto {
  symbol: string;
  address: string;
}
export class CandleOptionsDto {
  from?: string;
  to?: string;
  minTrade = 0;
  interval = 60;
}

export class CandleDto {
  timeInterval: {
    minute: string;
  };
  baseCurrency: CurrencyDto;
  quoteCurrency: CurrencyDto;
  tradeAmount: number;
  trades: number;
  quotePrice: number;
  maximum_price: number;
  minimum_price: number;
  open_price: string;
  close_price: string;
}
