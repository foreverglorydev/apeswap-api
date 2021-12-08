import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ethers, utils } from 'ethers';
import { Model } from 'mongoose';
import { NfaTracking, NfaTrackingDocument } from './schema/nfa-tracking.schema';

@Injectable()
export class NfasTrackingService {
  nfa_address = '0x6afc012783e3a6ef8c5f05f8eee2edef6a052ec4';
  wbnb_address = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  logger = new Logger(NfasTrackingService.name);
  provider = new ethers.providers.JsonRpcProvider(
    'https://bsc-dataseed.binance.org/',
  );
  abi = [
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  ];
  wbnbTransferedAbi = [
    'event Transfer(address indexed src, address indexed dst, uint wad);',
  ];

  iface = new utils.Interface(this.abi);

  wbnbIface = new utils.Interface(this.wbnbTransferedAbi);

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

  async parseZeroValue(event) {
    let value = 0;
    const transactionReceipt = await this.provider.getTransactionReceipt(
      event.transactionHash,
    );
    (transactionReceipt.logs || []).map((log) => {
      if (log.address === this.wbnb_address) {
        value += parseInt(this.wbnbIface.parseLog(log).args[2]);
      }
    });
    return value.toString();
  }

  async parseEvent(event) {
    const transaction = await this.provider.getTransaction(
      event.transactionHash,
    );
    // this.logger.log(transaction)
    const parsed = this.iface.parseLog(event);
    const { from, to } = parsed.args;
    const tokenId = parsed.args[2].toNumber();
    const value = transaction.value?.toString() || '0';
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
