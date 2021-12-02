import { ApiProperty } from "@nestjs/swagger";

export class NfaBid {
  @ApiProperty()
  readonly bidder: number;

  @ApiProperty()
  readonly amount: number;

  @ApiProperty()
  readonly tokenId: string;

  @ApiProperty()
  readonly auctionNumber: number;

  @ApiProperty()
  readonly transactionHash: string;

  @ApiProperty()
  readonly contractAddress: number;

  @ApiProperty()
  readonly blockNumber: string;
  
  @ApiProperty()
  readonly _id?: string;
}
