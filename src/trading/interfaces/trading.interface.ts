import { Pair } from './pair.interface';

export interface Trading {
  id: string;
  sender: string;
  timestamp: string;
  to: string;
  amountUSD: string;
  from: string;
  pair: Pair;
}
