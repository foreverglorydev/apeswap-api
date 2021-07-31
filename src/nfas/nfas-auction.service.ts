import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ethers, utils } from 'ethers';
import { Model } from 'mongoose';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { NfaAuctionDocument, NfaAuction } from './schema/nfa-auction.schema';

@Injectable()
export class NfasAuctionService {
  logger = new Logger(NfasAuctionService.name);
  abi = [
    'event HighestBidIncreased(address indexed bidder, uint256 amount, uint256 indexed id, uint indexed auctionNumber)',
  ];

  iface = new utils.Interface(this.abi);
  
  constructor(
    private configService: ChainConfigService,
    @InjectModel(NfaAuction.name)
    private nfaAuctionModel: Model<NfaAuctionDocument>,
  ) {}

  auctionAddress = this.configService.get<string>(`auction.address`);
  appNodes = this.configService.get<string>(`appNodes`);  
  provider = new ethers.providers.JsonRpcProvider(this.appNodes[0]);

  // return all txn with "tokenId = index" where "value != 0"
  async getNfaAuctionHistory(index: number): Promise<NfaAuctionDocument[]> {
    const sales = await this.nfaAuctionModel
      .find({ tokenId: index })
      .sort({ blockNumber: 'desc' });
    return sales;
  }

  // return all txn with "tokenId = index" in descending blockNumber
  async getAuctionHistory(
  ): Promise<NfaAuctionDocument[]> {
    const sales = await this.nfaAuctionModel
      .find()
      .sort({ blockNumber: 'desc' });
    return sales;
  }

  async fetchLogs({ startBlock }) {
    const filter = {
      address: this.auctionAddress,
      fromBlock: startBlock,
      toBlock: startBlock + 1000,
      topics: [
        // the name of the event, parnetheses containing the data type of each event, no spaces
        utils.id('HighestBidIncreased(address,uint256,uint256,uint256)'),
      ],
    };
    const events = await this.provider.getLogs(filter);
    const promises = [];
    for (const event of events) {
      promises.push(this.processEvent(event));
    }
    return Promise.all(promises);
  }

  async fetchLastBlockLogs() {
    const curBlock = await this.provider.getBlockNumber();
    return this.fetchLogs({ startBlock: curBlock - 1000 });
  }

  async processEvent(event) {
    const parsed = await this.parseEvent(event);
    return this.nfaAuctionModel.create(parsed);
  }

  async parseEvent(event) {
    const parsed = this.iface.parseLog(event);
    const { bidder, amount, id, auctionNumber } = parsed.args;
    const bidEvent = {
      contractAddress: event.address,
      auctionNumber: auctionNumber.toNumber(),
      bidder,
      amount: amount.toString(),
      tokenId: id.toNumber(),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber
      
    };
    return bidEvent;
  }

  async listenToEvents() {
    const filter = {
      address: this.auctionAddress,
      topics: [
        // the name of the event, parnetheses containing the data type of each event, no spaces
        utils.id('HighestBidIncreased(address,uint256,uint256,uint256)'),
      ],
    };
    this.provider.on(filter, async (event) => {
      this.logger.log('Bid triggered');
      this.logger.log(event);
      await this.processEvent(event);
    });
  }
}
