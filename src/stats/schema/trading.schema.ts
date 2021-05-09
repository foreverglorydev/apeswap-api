import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TradingStatsDocument = TradingStats & Document;

@Schema()
export class TradingStats {
  @Prop({ index: true, required: true })
  account: string;

  @Prop({ index: true, required: true })
  pair: string;

  @Prop({ index: true, required: true })
  season: number;

  @Prop({ required: true })
  totalTradedUsd: number;
}

export const TradingStatsSchema = SchemaFactory.createForClass(TradingStats);
