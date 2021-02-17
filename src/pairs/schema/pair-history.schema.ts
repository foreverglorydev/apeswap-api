import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Pair } from './pair.schema';

export type PairHistoryDocument = PairHistory & Document;

@Schema()
export class PairHistory {
  @Prop({ type: Types.ObjectId, ref: 'Pair', required: true })
  pair: Pair;

  @Prop({ required: true, index: true })
  symbol: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  timestamp: Date;
}

export const PairHistorySchema = SchemaFactory.createForClass(PairHistory);
