import { ApiProperty } from '@nestjs/swagger';
import { NfaSaleDto } from '../dto/nfaSale.dto';
import { NfaAttribute } from './nfaAttribute.interface';

export class Nfa {
  @ApiProperty()
  index: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  uri: string;

  @ApiProperty()
  public?: boolean;

  @ApiProperty()
  sale?: boolean;

  @ApiProperty()
  attributes?: NfaAttribute;

  @ApiProperty()
  address: string;

  @ApiProperty()
  history?: NfaSaleDto[];
}
