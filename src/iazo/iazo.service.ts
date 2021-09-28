import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Iazo } from './dto/iazo.dto';
import { Iazo as IazoSchema, IazoDocument } from './schema/iazo.schema';

@Injectable()
export class IazoService {
  constructor(
    @InjectModel(IazoSchema.name)
    private iazoModel: Model<IazoDocument>,
  ) {}

  async searchIaoz(filter) {
    return this.iazoModel.find(filter);
  }

  async createIazo(iazoDto: Iazo) {
    // send notification!?
    iazoDto.status = 'Pending';
    return this.iazoModel.create(iazoDto);
  }

  async fetchIaozs() {
    return await this.searchIaoz({ approvedAt: { $ne: null } });
  }

  async getIaozUser(ownerAddress) {
    return await this.searchIaoz({ owner: ownerAddress });
  }

  async detailIaoz(idIaoz) {
    return await this.iazoModel.findById(idIaoz);
  }
}
