import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NfaHolderDocument = NfaHolder & Document;

@Schema()
export class NfaHolder {
  @Prop({ unique: true, required: true })
  tokenId: number;

  @Prop({ required: true })
  address: string;
}

export const NfaHolderSchema = SchemaFactory.createForClass(NfaHolder);
