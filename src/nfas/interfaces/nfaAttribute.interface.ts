import { ApiProperty } from "@nestjs/swagger";

export class NfaAttribute {
  @ApiProperty()
  faceColor: string;

  @ApiProperty()
  baseColor: string;

  @ApiProperty()
  frames: string;

  @ApiProperty()
  mouths: string;

  @ApiProperty()
  eyes: string;

  @ApiProperty()
  hats: string;

  @ApiProperty()
  rarityScore: number;

  @ApiProperty()
  rarityTierNumber?: number;

  @ApiProperty()
  rarityTierName?: string;

  @ApiProperty()
  rarityOverallRank?: number;

}
