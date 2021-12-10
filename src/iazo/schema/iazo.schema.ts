import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TagLinkDto } from '../dto/iazoTag.dto';

export type IazoDocument = Iazo & Document;

@Schema()
export class Iazo {
  @Prop({ required: true })
  token1: string;

  @Prop({ required: true })
  token2: string;

  @Prop({ unique: true, required: true })
  iazoAddress: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  startDate: number;

  @Prop({ required: true })
  endDate: number;

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

  @Prop()
  whitepaper: string;

  @Prop({ required: true })
  twitter: string;

  @Prop({ required: true })
  telegram: string;

  @Prop({ required: true })
  medium: string;

  @Prop()
  description: string;

  @Prop()
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

  @Prop()
  tags: [TagLinkDto];
}

export const IazoSchema = SchemaFactory.createForClass(Iazo);
