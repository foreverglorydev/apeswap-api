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
  async searchIaoz(filter) {
    return this.iazoModel.find(filter);
  }

  async createIazo(iazoDto: Iazo, file) {
    this.dataValidate = [];
    await this.validateData(iazoDto);
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
    this.mailgunService.notifyByEmail(iazoDto);
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

  async validateData(data) {
    const tags = [
      'token1',
      'token2',
      'owner',
      'startDate',
      'endDate',
      'totalPresale',
      'limitDefault',
      'softcap',
      'hardcap',
      'percentageLock',
      'priceListing',
      'lockTime',
    ];
    for (let index = 0; index < tags.length; index++) {
      if (index < 3) this.validateAddress(data[tags[index]], tags[index]);
      if (index > 2 && index < 5) this.validateDates(data, tags[index]);
      if (index > 4) this.validateNumbers(data[tags[index]], tags[index]);
    }
    if (this.dataValidate.length > 0) {
      throw new HttpException(
        { message: 'One or more data is invalid', data: this.dataValidate },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateAddress(address, tag) {
    const obj = {};
    try {
      const isAddress = await this.web3.utils.isAddress(address);
      if (!isAddress) obj[tag] = 'Invalid address';
    } catch (error) {
      obj[tag] = 'Invalid';
    }
    this.dataValidate.push(obj);
  }

  async validateDates(data, tag) {
    const now = new Date();
    const date = data[tag];
    let stg = '';
    if (tag === 'startDate') {
      if (date * 1000 < now.getTime())
        stg += 'Start date cannot be less than the current date. ';
      if (data['startDate'] > data['endDate'])
        stg += 'Start date cannot be greater than the end date. ';
    }
    if (tag === 'endDate') {
      if (date * 1000 < now.getTime())
        stg += 'End date cannot be less than the current date. ';
    }
    if (isNaN(new Date(Number(date)).getTime()))
      stg += 'Date timestamp invalid.';
    if (stg !== '') {
      const obj = {};
      obj[tag] = stg;
      this.dataValidate.push(obj);
    }
  }

  async validateNumbers(number, tag) {
    let stg = '';
    if (isNaN(number)) {
      stg += 'Must be number';
    }
    if (number < 0) {
      stg += 'It cannot be a negative number';
    }
    if (stg !== '') {
      const obj = {};
      obj[tag] = stg;
      this.dataValidate.push(obj);
    }
  }
}
