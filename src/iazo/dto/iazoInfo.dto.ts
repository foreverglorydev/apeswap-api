import { ApiProperty } from '@nestjs/swagger';
import { TagLinkDto } from './iazoTag.dto';

export class IazoInfoDto {
  token1: string;
  token2: string;
  iazoAddress: string;
  owner: string;
  startDate: number;
  endDate: number;
  duration: number;
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
  description: string;
  pathImage: string;
  cancelledAt: Date;
  approvedAt: Date;
  status: string;
  verification: boolean;
  checked: boolean;
  comments: string;
  createdAt: Date;
  @ApiProperty({ type: () => [TagLinkDto] })
  tags: [TagLinkDto];
}
