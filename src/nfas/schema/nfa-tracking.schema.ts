import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NfaTrackingDocument = NfaTracking & Document;

@Schema()
export class NfaTracking {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  tokenId: number;

  @Prop()
  value: string;

  @Prop({ required: true, unique: true })
  transactionHash: string;

  @Prop({ required: true })
  blockNumber: number;
}

export const NfaTrackingSchema = SchemaFactory.createForClass(NfaTracking);
