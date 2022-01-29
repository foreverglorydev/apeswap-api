import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { QuoteToken, Token } from '../dto/pairInformation.dto';

export type PairBitqueryDocument = PairBitquery & Document;

@Schema()
export class PairBitquery {
  @Prop({ required: true })
  ticker_id: string;

  @Prop({ required: true })
  addressLP: string;

  @Prop({ required: true })
  base: Token;

  @Prop({ required: true })
  target: Token;

  @Prop({ required: true })
  liquidity: number;

  @Prop({ required: true })
  quote: QuoteToken;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PairBitquerySchema = SchemaFactory.createForClass(PairBitquery);
