import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { QuoteTokenDto, TokenDto } from '../dto/pairInformation.dto';

export type PairBitqueryDocument = PairBitquery & Document;

@Schema()
export class PairBitquery {
  @Prop({ required: true })
  ticker_id: string;

  @Prop({ required: true })
  addressLP: string;

  @Prop({ required: true })
  base: TokenDto;

  @Prop({ required: true })
  target: TokenDto;

  @Prop({ required: true })
  liquidity: number;

  @Prop({ required: true })
  quote: QuoteTokenDto;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PairBitquerySchema = SchemaFactory.createForClass(PairBitquery);
