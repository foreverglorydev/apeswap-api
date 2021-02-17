import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CandleDocument = Candle & Document;

@Schema()
export class Candle {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true, index: true })
  symbol: string;

  @Prop({ required: true })
  c: number;

  @Prop({ required: true })
  o: number;

  @Prop({ required: true })
  h: number;

  @Prop({ required: true })
  l: number;

  @Prop({ required: true })
  v: number;

  @Prop({ required: true })
  t: number;
}

export const CandleSchema = SchemaFactory.createForClass(Candle);
