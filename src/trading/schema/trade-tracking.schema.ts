import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TradeTrackingDocument = TradeTracking & Document;

@Schema()
export class TradeTracking {
  @Prop({ required: true })
  latestTimestamp: number;

  @Prop({ required: true })
  currentSeason: number;

  @Prop({ required: true })
  bananaPerUsd: number;
}

export const TradeTrackingSchema = SchemaFactory.createForClass(TradeTracking);
