import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Apestrong, ApestrongDocument } from './schema/apestrong.schema';

@Injectable()
export class ApestrongService {
  logger = new Logger(ApestrongService.name);
  constructor(
    @InjectModel(Apestrong.name)
    private apestrongModel: Model<ApestrongDocument>,
  ) {}

  async getApestrongByIndex(index: number) {
    return this.apestrongModel.findOne({ index });
  }
}
