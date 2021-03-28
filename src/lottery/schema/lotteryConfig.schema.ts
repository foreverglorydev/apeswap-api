import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LotteryConfigDocument = LotteryConfig & Document;

@Schema({ timestamps: true })
export class LotteryConfig {
  @Prop()
  drawHours: number[];
}

export const LotteryConfigSchema = SchemaFactory.createForClass(LotteryConfig);
