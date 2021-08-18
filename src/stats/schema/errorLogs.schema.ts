import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ErrorLogsDocument = ErrorLogs & Document;

@Schema()
export class ErrorLogs {
  @Prop({ required: true })
  description: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ErrorLogsSchema = SchemaFactory.createForClass(ErrorLogs);
