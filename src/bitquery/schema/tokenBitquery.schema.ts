import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { QuoteTokenDto } from '../dto/pairInformation.dto';

export type TokenBitqueryDocument = TokenBitquery & Document;

@Schema()
export class TokenBitquery {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  tokenPrice: number;

  @Prop({ required: true })
  totalSupply: number;

  @Prop({ required: true })
  burntAmount: number;

  @Prop({ required: true })
  circulatingSupply: number;

  @Prop({ required: true })
  marketCap: number;

  @Prop({ required: true })
  quote: QuoteTokenDto;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TokenBitquerySchema = SchemaFactory.createForClass(TokenBitquery);
