import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TradeSeasonDocument = TradeSeason & Document;

@Schema()
export class TradeSeason {
  @Prop({ required: true })
  pair: string;

  @Prop({ required: true })
  season: number;

  @Prop({ required: true })
  latestTimestamp: number;

  @Prop({ required: true })
  usdPerBanana: number;
}

export const TradeSeasonSchema = SchemaFactory.createForClass(TradeSeason);
