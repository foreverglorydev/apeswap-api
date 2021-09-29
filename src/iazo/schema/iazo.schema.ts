import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IazoDocument = Iazo & Document;

@Schema()
export class Iazo {
  @Prop({ required: true })
  token1: string;

  @Prop({ required: true })
  token2: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  startDate: number;

  @Prop({ required: true })
  endDate: number;

  @Prop({ default: null })
  startBlock: number;

  @Prop({ default: null })
  endBlock: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  totalPresale: number;

  @Prop({ required: true })
  pricePresale: number;

  @Prop({ required: true })
  limitDefault: number;

  @Prop({ required: true })
  softcap: number;

  @Prop({ required: true })
  hardcap: number;

  @Prop({ required: true })
  burnRemaining: boolean;

  @Prop({ required: true })
  percentageLock: number;

  @Prop({ required: true })
  priceListing: number;

  @Prop({ required: true })
  lockTime: number;

  @Prop({ required: true })
  website: string;

  @Prop({ required: true })
  whitepaper: string;

  @Prop({ required: true })
  twitter: string;

  @Prop({ required: true })
  telegram: string;

  @Prop({ required: true })
  medium: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  pathImage: string;

  @Prop({ default: null })
  cancelledAt: Date;

  @Prop({ default: null })
  approvedAt: Date;
  // internal fields team
  @Prop({ default: null })
  status: string;

  @Prop({ default: null })
  verification: boolean;

  @Prop({ default: null })
  checked: boolean;

  @Prop({ default: null })
  comments: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const IazoSchema = SchemaFactory.createForClass(Iazo);
