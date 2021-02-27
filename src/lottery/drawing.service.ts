import { Injectable, Logger } from '@nestjs/common';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { getWeb3 } from 'src/utils/lib/web3';
import { getLotteryContract } from './utils/lottery.utils';

@Injectable()
export class DrawingService {
  private readonly logger = new Logger(DrawingService.name);

  constructor(private configService: ChainConfigService) {}

  web3 = getWeb3();
  adminAddress = this.configService.get<string>(`lottery.adminAddress`);
  lotteryContractAddress = this.configService.get<string>(`lottery.address`);
  adminPrivateKey = this.configService.get<string>(`lottery.adminKey`);
  chainId = this.configService.chainId;
  lottery = getLotteryContract();

  async enterDrawing() {
    const nonce = await this.web3.eth.getTransactionCount(this.adminAddress);
    const gasPriceWei = await this.web3.eth.getGasPrice();
    const data = this.lottery.methods.enterDrawingPhase().encodeABI();

    const signedTx = await this.web3.eth.accounts.signTransaction(
      {
        to: this.lotteryContractAddress,
        gas: 2000000,
        data: data,
        gasPrice: gasPriceWei,
        nonce: nonce,
        chainId: this.chainId,
      },
      this.adminPrivateKey,
    );
    console.log(signedTx);

    await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction || signedTx.rawTransaction,
    );
  }

  async drawing() {
    const nonce = await this.web3.eth.getTransactionCount(this.adminAddress);
    const gasPriceWei = await this.web3.eth.getGasPrice();
    const randomNumber = Math.floor(Math.random() * 10 + 1);
    const data = this.lottery.methods.drawing(randomNumber).encodeABI();

    const signedTx = await this.web3.eth.accounts.signTransaction(
      {
        to: this.lotteryContractAddress,
        gas: 2000000,
        data: data,
        gasPrice: gasPriceWei,
        nonce: nonce,
        chainId: this.chainId,
      },
      this.adminPrivateKey,
    );

    await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction || signedTx.rawTransaction,
    );
  }

  async reset() {
    const nonce = await this.web3.eth.getTransactionCount(this.adminAddress);
    const gasPriceWei = await this.web3.eth.getGasPrice();

    const signedTx = await this.web3.eth.accounts.signTransaction(
      {
        to: this.lotteryContractAddress,
        gas: 2000000,
        data: '0xd826f88f',
        gasPrice: gasPriceWei,
        nonce: nonce,
        chainId: this.chainId,
      },
      this.adminPrivateKey,
    );

    await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction || signedTx.rawTransaction,
    );
  }
}
