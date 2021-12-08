import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NfaAttributeDocument = NfaAttribute & Document;

@Schema()
export class NfaAttribute {
  @Prop({ required: true })
  faceColor: string;

  @Prop({ required: true })
  baseColor: number;

  @Prop({ required: true })
  frames: Date;

  @Prop({ required: true })
  mouths: string;

  @Prop({ required: true })
  eyes: number;

  @Prop({ required: true })
  hats: Date;

  @Prop({ required: true })
  rarityScore: string;
}

export const NfaAttributeSchema = SchemaFactory.createForClass(NfaAttribute);
