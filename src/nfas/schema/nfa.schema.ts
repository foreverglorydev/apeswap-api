import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NfaAttribute } from '../interfaces/nfaAttribute.interface';

export type NfaDocument = Nfa & Document;

@Schema()
export class Nfa {
  @Prop({ required: true, unique: true, index: true })
  index: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  uri: string;

  @Prop({ default: 1 })
  public?: boolean;

  @Prop({ default: 1 })
  sale?: boolean;

  @Prop({ type: Types.ObjectId, required: true })
  attributes?: NfaAttribute;

  @Prop({ default: '' })
  address: string;
}

export const NfaSchema = SchemaFactory.createForClass(Nfa);
