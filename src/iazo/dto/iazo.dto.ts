import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  Validate,
} from 'class-validator';
import { IsAddress } from 'src/utils/validator/isAddress';
import { IsValidateDate } from 'src/utils/validator/isValidateDate';

export class IazoDto {
  @Validate(IsAddress)
  token1: string;

  @Validate(IsAddress)
  token2: string;

  @Validate(IsAddress)
  owner: string;

  @Validate(IsAddress)
  iazoAddress: string;

  @Validate(IsValidateDate)
  startDate: number;

  @Validate(IsValidateDate)
  endDate: number;

  startBlock?: number;

  endBlock?: number;

  @IsOptional()
  @Min(0)
  duration?: number;

  @IsNumber()
  @IsPositive()
  totalPresale: number;

  @IsNumber()
  @IsPositive()
  pricePresale: number;

  @IsNumber()
  @IsPositive()
  limitDefault: number;

  @IsNumber()
  @IsPositive()
  softcap: number;

  @IsNumber()
  @IsPositive()
  hardcap: number;

  @IsBoolean()
  burnRemaining: boolean;

  @IsNumber()
  @Min(0)
  percentageLock: number;

  @IsNumber()
  @IsPositive()
  priceListing: number;

  @IsNumber()
  lockTime: number;

  @IsNotEmpty()
  website: string;

  @IsNotEmpty()
  whitepaper: string;

  @IsNotEmpty()
  twitter: string;

  @IsNotEmpty()
  telegram: string;

  @IsNotEmpty()
  medium: string;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  pathFile?: string;
}

export class Iazo extends IazoDto {
  status?: string;
  verification?: boolean;
  checked?: boolean;
  comments?: string;
}
