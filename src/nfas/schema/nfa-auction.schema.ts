import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NfaAuctionDocument = NfaAuction & Document;

@Schema()
export class NfaAuction {
  @Prop({ required: true })
  bidder: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  tokenId: number;

  @Prop({ required: true })
  auctionNumber: number;

  @Prop({ required: true, unique: true })
  transactionHash: string;

  @Prop({ required: true })
  contractAddress: string;

  @Prop({ required: true })
  blockNumber: number;
}

export const NfaAuctionSchema = SchemaFactory.createForClass(NfaAuction);
