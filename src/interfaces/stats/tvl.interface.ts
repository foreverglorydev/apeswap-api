import { ApiProperty } from "@nestjs/swagger";

export class StatsChain {
  @ApiProperty()
  tvl: number;

  @ApiProperty()
  totalLiquidity: number;
  
  @ApiProperty()
  totalVolume: number;
}

export class GeneralStatsChain {
  @ApiProperty()
  tvl: number;
  
  @ApiProperty()
  totalLiquidity: number;
  
  @ApiProperty()
  totalVolume: number;
  
  @ApiProperty({ type: () => StatsChain })
  bsc: StatsChain;
  
  @ApiProperty({ type: () => StatsChain })
  polygon: StatsChain;
  
  @ApiProperty()
  burntAmount: number;
  
  @ApiProperty()
  totalSupply: number;
  
  @ApiProperty()
  circulatingSupply: number;
  
  @ApiProperty()
  marketCap: number;
  
  @ApiProperty()
  gnanaCirculatingSupply: number;
}
