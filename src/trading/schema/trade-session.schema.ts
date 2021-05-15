import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TradeSessionDocument = TradeSession & Document;

@Schema()
export class TradeSession {
  @Prop({ index: true, required: true })
  pair: string;

  @Prop({ index: true, required: true })
  season: number;

  @Prop({ required: true })
  bananaPerUsd: number;
}

export const TradeSessionSchema = SchemaFactory.createForClass(TradeSession);
