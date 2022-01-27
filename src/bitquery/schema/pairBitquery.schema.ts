import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PairBitqueryDocument = PairBitquery & Document;

@Schema()
export class PairBitquery {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  ticker_id: string;

  @Prop({ required: true })
  base: string;

  @Prop({ unique: true, required: true })
  target: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  value_usd: number;

  @Prop({ required: true })
  base_address: string;

  @Prop({ required: true })
  target_address: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quote_currency_address: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PairBitquerySchema = SchemaFactory.createForClass(PairBitquery);
