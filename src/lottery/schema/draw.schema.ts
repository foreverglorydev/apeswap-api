import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DrawDocument = Draw & Document;

@Schema({ timestamps: true })
export class Draw {
  @Prop({ required: true, unique: true, index: true })
  index: number;

  @Prop()
  drawTime: Date;
}

export const DrawSchema = SchemaFactory.createForClass(Draw);
