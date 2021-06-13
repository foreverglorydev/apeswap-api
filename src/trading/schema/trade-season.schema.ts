import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TradeSeasonDocument = TradeSeason & Document;

@Schema()
export class TradeSeason {
  @Prop({ required: true })
  pair: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  season: number;

  @Prop({ required: true })
  startTimestamp: number;

  @Prop({ required: true })
  endTimestamp: number;

  @Prop()
  latestTimestamp: number;

  @Prop()
  latestDayTimestamp: number;

  @Prop()
  processed: boolean;

  @Prop()
  processedToday: boolean;

  @Prop({ required: true })
  usdPerBanana: number;
}

export const TradeSeasonSchema = SchemaFactory.createForClass(TradeSeason);
