import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ethers, utils } from 'ethers';
import { Model } from 'mongoose';
import { NfaTracking, NfaTrackingDocument } from './schema/nfa-tracking.schema';

@Injectable()
export class NfasTrackingService {
  nfa_address = '0x6eca7754007d22d3F557740d06FeD4A031BeFE1e';
  lootex_address = '0x145F83aD6108391cbF9ed554E5cE1dbd984437f8';
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

  nftKeyAuctionAbi = [
    'event TokenBidAccepted(uint256 indexed tokenId, address indexed from, address indexed to, uint256 total, uint256 value, uint256 fees)',
  ];

  lootexAbi = [
    'event Fill(address indexed makerAddress, address indexed feeRecipientAddress, address takerAddress, address senderAddress, uint256 makerAssetFilledAmount, uint256 takerAssetFilledAmount, uint256 makerFeePaid, uint256 takerFeePaid, bytes32 indexed orderHash, bytes makerAssetData, bytes takerAssetData)',
  ];

  iface = new utils.Interface(this.abi);
  nftKeyAuctionIface = new utils.Interface(this.nftKeyAuctionAbi);
  lootexIface = new utils.Interface(this.lootexAbi);

  constructor(
    @InjectModel(NfaTracking.name)
    private nfaTrackingModel: Model<NfaTrackingDocument>,
  ) {}

  async getNfaTransactions(index: number): Promise<NfaTrackingDocument[]> {
    const sales = await this.nfaTrackingModel.find({ tokenId: index });
    this.logger.log(sales);
    return sales;
  }

  // return all txn with "tokenId = index" where "value != 0"
  async getNfaSellHistory(index: number): Promise<NfaTrackingDocument[]> {
    const sales = await this.nfaTrackingModel
      .find({ tokenId: index })
      .where('value')
      .ne('0')
      .sort({ blockNumber: 'desc' });
    this.logger.log(sales);
    return sales;
  }

  // return all txn with "tokenId = index" in descending blockNumber
  async getNfaTransactionHistoryDescendingBlock(
    index: number,
  ): Promise<NfaTrackingDocument[]> {
    const sales = await this.nfaTrackingModel
      .find({ tokenId: index })
      .sort({ blockNumber: 'desc' });
    this.logger.log(sales);
    return sales;
  }

  async fetchLogs({ startBlock }) {
    const filter = {
      address: this.nfa_address,
      fromBlock: startBlock,
      toBlock: startBlock + 1000,
      topics: [
        // the name of the event, parnetheses containing the data type of each event, no spaces
        utils.id('Transfer(address,address,uint256)'),
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
    this.logger.log('Parsed event');
    this.logger.log(parsed);
    return this.nfaTrackingModel.create(parsed);
  }

  async parseLootex(transactionReceipt) {
    try {
      const fillLog = transactionReceipt.logs[0];
      const value = this.lootexIface.parseLog(fillLog).args[5];
      return value.toString();
    } catch (error) {
      this.logger.log(error);
      return '0';
    }
  }

  async parseNftKeyAuction(transactionReceipt) {
    try {
      const auctionLog = transactionReceipt.logs.slice(-1).pop();
      const value = this.nftKeyAuctionIface.parseLog(auctionLog).args[3];
      return value.toString();
    } catch (error) {
      this.logger.log(error);
      return '0';
    }
  }

  async parseZeroValue(event) {
    // this.logger.log(event)
    const transactionReceipt = await this.provider.getTransactionReceipt(
      event.transactionHash,
    );
    if (transactionReceipt.to === this.lootex_address) {
      return this.parseLootex(transactionReceipt);
    } else {
      return this.parseNftKeyAuction(transactionReceipt);
    }
  }

  async parseEvent(event) {
    const transaction = await this.provider.getTransaction(
      event.transactionHash,
    );
    // this.logger.log(transaction)
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
    if (transferEvent.value === '0') {
      transferEvent.value = await this.parseZeroValue(event);
    }
    return transferEvent;
  }

  async listenToEvents() {
    const filter = {
      address: this.nfa_address,
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
