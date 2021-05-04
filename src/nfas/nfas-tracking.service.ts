import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BigNumber, ethers, utils } from 'ethers';
import { Model } from 'mongoose';
import { NfaTracking, NfaTrackingDocument } from './schema/nfa-tracking.schema';

@Injectable()
export class NfasTrackingService {
  logger = new Logger(NfasTrackingService.name);
  urlInfo = {
    url: process.env.APE_RPC,
    user: process.env.RPC_USER,
    password: process.env.RPC_PASSWORD,
  };
  provider = new ethers.providers.JsonRpcProvider(this.urlInfo);

  abi = [
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  ];
  iface = new utils.Interface(this.abi);

  constructor(
    @InjectModel(NfaTracking.name)
    private nfaTrackingModel: Model<NfaTrackingDocument>,
  ) {}

  async fetchLogs({ startBlock }) {
    const filter = {
      address: '0x6eca7754007d22d3F557740d06FeD4A031BeFE1e',
      fromBlock: startBlock,
      toBlock: startBlock + 1000,
      topics: [
        // the name of the event, parnetheses containing the data type of each event, no spaces
        utils.id('Transfer(address,address,uint256)'),
      ],
    };
    console.log(filter);
    const events = await this.provider.getLogs(filter);
    console.log(events);
    const promises = [];
    for (const event of events) {
      promises.push(this.processEvent(event));
    }
    return Promise.all(promises);
  }

  async processEvent(event) {
    const parsed = await this.parseEvent(event);
    this.logger.log('Parsed event');
    this.logger.log(parsed);
    return this.nfaTrackingModel.create(parsed);
  }

  async parseEvent(event) {
    const transaction = await this.provider.getTransaction(
      event.transactionHash,
    );
    const parsed = this.iface.parseLog(event);
    const { from, to } = parsed.args;
    const tokenId = parsed.args[2].toNumber();
    const value = transaction.value.toString();
    const { transactionHash, blockNumber } = event;
    const transferEvent = {
      from,
      to,
      tokenId,
      value,
      transactionHash,
      blockNumber,
    };
    return transferEvent;
  }

  async listenToEvents() {
    const filter = {
      address: '0x6eca7754007d22d3F557740d06FeD4A031BeFE1e',
      topics: [
        // the name of the event, parnetheses containing the data type of each event, no spaces
        utils.id('Transfer(address,address,uint256)'),
      ],
    };
    this.provider.on(filter, async (event) => {
      this.logger.log('Transfer triggered');
      this.logger.log(event);
      await this.processEvent(event);
    });
  }
}
