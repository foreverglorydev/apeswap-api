import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GeneralStatsNetworkDocument = GeneralStatsNetwork & Document;

@Schema()
export class GeneralStatsNetwork {
  @Prop()
  chainId: number;

  @Prop()
  bananaPrice: number;

  @Prop()
  burntAmount: number;

  @Prop()
  totalSupply: number;

  @Prop()
  circulatingSupply: number;

  @Prop()
  marketCap: number;

  @Prop({ required: true })
  poolsTvl: number;

  @Prop()
  pools: [];

  @Prop()
  farms: [];

  @Prop()
  incentivizedPools: [];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const GeneralStatsNetworkSchema = SchemaFactory.createForClass(
  GeneralStatsNetwork,
);
