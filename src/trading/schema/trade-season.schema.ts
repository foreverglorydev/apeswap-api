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
  startTimestamp: number;

  @Prop({ required: true })
  endTimestamp: number;

  @Prop({ required: true })
  latestTimestamp: number;

  @Prop()
  processed: boolean;

  @Prop()
  processedToday: boolean;

  @Prop()
  finished: boolean;

  @Prop({ required: true })
  usdPerBanana: number;

  @Prop()
  lastUpdateTimestamp: number;
}

export const TradeSeasonSchema = SchemaFactory.createForClass(TradeSeason);
