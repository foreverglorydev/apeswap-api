import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TvlStatsDocument = TvlStats & Document;

@Schema()
export class TvlStats {
  @Prop({ required: true })
  tvl: number;

  @Prop({ required: true })
  totalLiquidity: number;

  @Prop({ required: true })
  totalVolume: number;

  @Prop({ required: true })
  bsc: [];

  @Prop({ required: true })
  polygon: [];

  @Prop({ required: true })
  burntAmount: number;

  @Prop({ required: true })
  totalSupply: number;

  @Prop({ required: true })
  circulatingSupply: number;

  @Prop({ required: true })
  marketCap: number;

  @Prop({ required: true })
  gnanaCirculatingSupply: number;

  @Prop({ required: true })
  lendingTvl: number;

  @Prop({ required: false })
  partnerCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TvlStatsSchema = SchemaFactory.createForClass(TvlStats);
