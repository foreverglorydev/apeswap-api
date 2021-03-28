export interface Rates {
  burn: number;
  rollover: number;
  jackpot: number;
  match3: number;
  match2: number;
  match1?: number;
}

// Rates since 348
export const rates: Rates = {
  burn: 15,
  rollover: 15,
  jackpot: 50,
  match3: 12,
  match2: 8,
};
