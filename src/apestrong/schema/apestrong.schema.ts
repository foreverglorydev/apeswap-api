import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApestrongDocument = Apestrong & Document;

@Schema()
export class Apestrong {
  @Prop({ required: true, unique: true, index: true })
  index: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  uri: string;
}

export const ApestrongSchema = SchemaFactory.createForClass(Apestrong);
