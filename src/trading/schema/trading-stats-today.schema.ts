import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TradingTodayStatsDocument = TradingTodayStats & Document;

@Schema()
export class TradingTodayStats {
  @Prop({ index: true, required: true })
  address: string;

  @Prop({ index: true, required: true })
  pair: string;

  @Prop({ index: true, required: true })
  season: number;

  @Prop({ required: true })
  totalTradedUsd: number;

  @Prop()
  pendingBananaRewards: number;
}

export const TradingTodayStatsSchema = SchemaFactory.createForClass(
  TradingTodayStats,
);
