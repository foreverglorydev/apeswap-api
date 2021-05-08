import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Pair } from '../interfaces/pair.interface'

export type TradingDocument = Trading & Document;

@Schema()
export class Trading {
    @Prop({required: true, unique: true, index: true})
    index: number;

    @Prop({required: true})
    sender: string;

    @Prop({required: true})
    timestamp: string;

    @Prop({required: true})
    to: string;

    @Prop({required: true})
    amountUSD: string;

    @Prop({required: true})
    from: string;

    @Prop({required: true})
    pair: Pair;
    
}

export const NfaSchema = SchemaFactory.createForClass(Trading);
