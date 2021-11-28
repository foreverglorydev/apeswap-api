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
import { IsValidateBoolean } from 'src/utils/validator/isValidateBoolean';
import { IsValidateDate } from 'src/utils/validator/isValidateDate';
import { IsValidateNumber } from 'src/utils/validator/isValidateNumber';

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

  @Validate(IsValidateNumber)
  duration?: number;

  @Validate(IsValidateNumber)
  totalPresale: number;

  @Validate(IsValidateNumber)
  pricePresale: number;

  @Validate(IsValidateNumber)
  limitDefault: number;

  @Validate(IsValidateNumber)
  softcap: number;

  @Validate(IsValidateNumber)
  hardcap: number;

  @Validate(IsValidateBoolean)
  burnRemaining: boolean;

  @Validate(IsValidateNumber)
  percentageLock: number;

  @Validate(IsValidateNumber)
  priceListing: number;

  @Validate(IsValidateNumber)
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

  @IsNotEmpty()
  description?: string;
}

export class Iazo extends IazoDto {
  pathImage?: string;
  status?: string;
  verification?: boolean;
  checked?: boolean;
  comments?: string;
}
