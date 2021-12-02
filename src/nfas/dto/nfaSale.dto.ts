import { ApiProperty } from "@nestjs/swagger";

export class NfaSaleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  index: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  amount: number
  ;
  @ApiProperty()
  tx: string;

  @ApiProperty()
  date?: string;

}
