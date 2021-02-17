import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PairDocument = Pair & Document;

@Schema()
export class Pair {
  @Prop({ required: true, unique: true, index: true })
  address: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  base: string;

  @Prop()
  latestPrice: number;

  @Prop()
  latestTimestamp: number;
}

export const PairSchema = SchemaFactory.createForClass(Pair);
