import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { isTransactionMined } from 'src/utils/lib/web3';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../services/cloudinary/cloudinary.service';
import { Iazo } from './dto/iazo.dto';
import { Iazo as IazoSchema, IazoDocument } from './schema/iazo.schema';
import { MailgunService } from 'src/services/mailgun/mailgun.service';
import { getContract } from 'src/utils/lib/web3';
import iazoABI from './utils/iazo.json';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import sleep from 'sleep-promise';

@Injectable()
export class IazoService {
  logger = new Logger(IazoService.name);
  maxUploadSizeMb = process.env.MAX_UPLOAD_SIZE || 2;

  iazoExposerAddress = this.configService.get<string>(`iazoExposer`);

  constructor(
    @InjectModel(IazoSchema.name)
    private iazoModel: Model<IazoDocument>,
    @Inject(CloudinaryService)
    private readonly _cloudinaryService: CloudinaryService,
    private mailgunService: MailgunService,
    private configService: ChainConfigService,
  ) {}

  async searchIaoz(filter = {}) {
    return this.iazoModel.find(filter);
  }

  async createIazo(iazoDto: Iazo, file: Express.Multer.File) {
    const verification = await this.validateIazo({
      address: iazoDto.iazoAddress,
      transactionHash: iazoDto.createTransactionHash,
    });

    const uniqueIazo = await this.searchIaoz({
      iazoAddress: iazoDto.iazoAddress,
    });

    if (uniqueIazo.length > 0)
      throw new BadRequestException('Iazo already exists');
    let uploadFile = {
      url: '',
    };

    const fileSize = file.size / 1024 / 1024; // in MiB
    if (fileSize > this.maxUploadSizeMb)
      throw new BadRequestException('Image larger than 2MB');
    try {
      uploadFile = await this._cloudinaryService.uploadBuffer(file.buffer);
    } catch (error) {
      console.log('Upload image', error);
    }

    iazoDto.status = 'Pending';
    iazoDto.pathImage = uploadFile?.url;
    iazoDto.verification = verification;
    // notification email
    const iazo = await this.iazoModel.create(iazoDto);
    this.mailgunService.notifyByEmail('New IAZO', 'iazo', iazoDto);
    return iazo;
  }

  async fetchIaozs() {
    return await this.searchIaoz();
  }

  async getIaozUser(ownerAddress) {
    return await this.searchIaoz({ owner: ownerAddress });
  }

  async getIazoByAddress(address) {
    return this.searchIaoz({ iazoAddress: address });
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

  async addTagIazo(_id, tags) {
    const iazo = await this.detailIaoz(_id);
    const data = [...iazo.tags, tags];
    return await this.iazoModel.updateOne({ _id }, { tags: data });
  }

  async updateTagIazo(_id, tags, position) {
    const iazo = await this.detailIaoz(_id);
    iazo.tags[position] = tags;
    const data = [...iazo.tags];
    return await this.iazoModel.updateOne({ _id }, { tags: data });
  }

  async removeTagIazo(_id, position) {
    const iazo = await this.detailIaoz(_id);
    iazo.tags.splice(position, 1);
    return await this.iazoModel.updateOne({ _id }, { tags: iazo.tags });
  }

  async validateAddressIazo(address) {
    const iazoContract = getContract(iazoABI, this.iazoExposerAddress);
    const isRegistered = await iazoContract.methods
      .IAZOIsRegistered(address)
      .call();
    if (!isRegistered) return false;
    return true;
  }

  async validateIazo({ address, transactionHash }) {
    let retry = 0;
    let isMined = await isTransactionMined(transactionHash);
    while (!isMined && retry < 20) {
      await sleep(retry * 200);
      isMined = await isTransactionMined(transactionHash);
      retry++;
    }
    if (!isMined) return false;
    return this.validateAddressIazo(address);
  }
}
