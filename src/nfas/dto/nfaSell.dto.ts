import { ApiProperty } from "@nestjs/swagger";

export class NfaSell {
  @ApiProperty()
  readonly from: string;

  @ApiProperty()
  readonly to: string;

  @ApiProperty()
  readonly tokenId: number;

  @ApiProperty()
  readonly value: string;

  @ApiProperty()
  readonly transactionHash: string;

  @ApiProperty()
  readonly blockNumber: number;
}
