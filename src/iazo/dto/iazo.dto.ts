export class IazoDto {
  token1: string;
  token2: string;
  owner: string;
  startDate: Date;
  endDate: Date;
  startBlock: number;
  endBlock: number;
  totalPresale: number;
  pricePresale: number;
  limitDefault: number;
  softcap: number;
  hardcap: number;
  burnRemaining: boolean;
  percentageLock: number;
  priceListing: number;
  lockTime: number;
  website: string;
  whitepaper: string;
  twitter: string;
  telegram: string;
  medium: string;
  description?: string;
}

export class Iazo extends IazoDto {
  status?: string;
  verification?: boolean;
  checked?: boolean;
  comments?: string;
}
