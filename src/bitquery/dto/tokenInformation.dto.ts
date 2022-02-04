import { QuoteToken } from './pairInformation.dto';

export class TokenInformation {
  name?: string;
  symbol?: string;
  address?: string;
  tokenPrice?: number;
  totalSupply?: number;
  burntAmount?: number;
  circulatingSupply?: number;
  marketCap?: number;
  quote?: QuoteToken;
}
