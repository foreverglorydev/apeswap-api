import { Inject, Injectable } from '@nestjs/common';
import { getWeb3 } from 'src/utils/lib/web3';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Iazo } from './dto/iazo.dto';
import { Iazo as IazoSchema, IazoDocument } from './schema/iazo.schema';

@Injectable()
export class IazoService {
  constructor(
    @InjectModel(IazoSchema.name)
    private iazoModel: Model<IazoDocument>,
    @Inject(CloudinaryService)
    private readonly _cloudinaryService: CloudinaryService,
  ) {}
  web3 = getWeb3();
  async searchIaoz(filter) {
    return this.iazoModel.find(filter);
  }

  async createIazo(iazoDto: Iazo, file) {
    const uploadFile = await this._cloudinaryService.uploadBuffer(file.buffer);
    iazoDto.status = 'Pending';
    iazoDto.pathFile = uploadFile.url;
    const { startBlockTime, endBlockTime } = await this.calculateBlock(
      iazoDto.startDate,
      iazoDto.endDate,
    );
    iazoDto.startBlock = startBlockTime;
    iazoDto.endBlock = endBlockTime;
    // notification Discord
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

  async calculateBlock(startTimestamp, endTimestamp) {
    const block = await this.web3.eth.getBlockNumber();
    const blockTimestamp = await (await this.web3.eth.getBlock(block))
      .timestamp;

    const startBlockTime =
      Math.round((startTimestamp - Number(blockTimestamp)) / 3) + 20 + block;
    const endBlockTime =
      Math.round((endTimestamp - Number(blockTimestamp)) / 3) + 20 + block;

    return { startBlockTime, endBlockTime };
  }
}
