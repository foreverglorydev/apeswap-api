import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { getWeb3 } from 'src/utils/lib/web3';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../services/cloudinary/cloudinary.service';
import { Iazo } from './dto/iazo.dto';
import { Iazo as IazoSchema, IazoDocument } from './schema/iazo.schema';
import { MailgunService } from 'src/services/mailgun/mailgun.service';
@Injectable()
export class IazoService {
  constructor(
    @InjectModel(IazoSchema.name)
    private iazoModel: Model<IazoDocument>,
    @Inject(CloudinaryService)
    private readonly _cloudinaryService: CloudinaryService,
    private mailgunService: MailgunService,
  ) {}
  web3 = getWeb3();
  dataValidate = [];
  async searchIaoz(filter = {}) {
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
    this.mailgunService.notifyByEmail('New IAZO', 'iazo', iazoDto);
    return this.iazoModel.create(iazoDto);
  }

  async fetchIaozs() {
    return await this.searchIaoz();
  }

  async getIaozUser(ownerAddress) {
    return await this.searchIaoz({ owner: ownerAddress });
  }

  async detailIaoz(iazoId) {
    return await this.iazoModel.findById(iazoId);
  }

  async fetchIazoStaff() {
    return this.iazoModel.find();
  }

  async approveIazo(_id, approveIazoDto) {
    const subject =
      approveIazoDto.status === 'Rejected' ? 'Rejected IAZO' : 'Approved IAZO';
    const data = {
      approved: approveIazoDto.status === 'Approved',
      rejected: approveIazoDto.status === 'Rejected',
      comments: approveIazoDto.comments,
    };
    this.mailgunService.notifyByEmail(subject, 'iazo_approve', data);
    return await this.iazoModel.updateOne({ _id }, approveIazoDto);
  }

  async updateTagsIazo(_id, tags) {
    return await this.iazoModel.updateOne({ _id }, { tags: tags.tags });
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
