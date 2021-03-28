import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { getWeb3 } from 'src/utils/lib/web3';
import { LotteryService } from './lottery.service';
import { Draw, DrawDocument } from './schema/draw.schema';
import { getIssueIndex, getLotteryContract } from './utils/lottery.utils';

@Injectable()
export class DrawingService {
  private readonly logger = new Logger(DrawingService.name);

  constructor(
    private configService: ChainConfigService,
    private lotteryService: LotteryService,
    @InjectModel(Draw.name)
    private drawModel: Model<DrawDocument>,
  ) {}

  isDrawing = false;
  isReset = true;
  web3 = getWeb3();
  adminAddress = this.configService.get<string>(`lottery.adminAddress`);
  lotteryContractAddress = this.configService.get<string>(`lottery.address`);
  adminPrivateKey = this.configService.get<string>(`lottery.adminKey`);
  chainId = this.configService.chainId;
  lottery = getLotteryContract();

  async getDrawHours() {
    const { drawHours } = await this.lotteryService.getConfig();
    return drawHours;
  }

  async getClosestLotteryHour(currentHour) {
    const drawHours = await this.getDrawHours();
    if (currentHour > drawHours[drawHours.length - 1]) return drawHours[0];
    return drawHours.reduce((a, b) => {
      const aDiff = Math.abs(a - currentHour);
      const bDiff = Math.abs(b - currentHour);

      if (aDiff == bDiff) {
        return a > b ? a : b;
      } else {
        return bDiff < aDiff ? b : a;
      }
    });
  }

  async getNextLotteryDrawTime() {
    const date = new Date();
    const currentHour = date.getUTCHours();
    const currentMin = date.getUTCMinutes();
    const nextLotteryHour = await this.getClosestLotteryHour(currentHour);
    const nextLotteryIsTomorrow =
      (currentHour === nextLotteryHour && currentMin >= 10) ||
      currentHour > nextLotteryHour;

    let millisTimeOfNextDraw;

    if (nextLotteryIsTomorrow) {
      const tomorrow = new Date();
      const nextDay = tomorrow.getUTCDate() + 1;
      tomorrow.setUTCDate(nextDay);
      millisTimeOfNextDraw = tomorrow.setUTCHours(nextLotteryHour, 0, 0, 0);
    } else {
      millisTimeOfNextDraw = date.setUTCHours(nextLotteryHour, 0, 0, 0);
    }

    return { millisTimeOfNextDraw };
  }

  // Runs every 20 seconds
  @Cron('20 * * * * *')
  async process() {
    // if (this.chainId == 56) return;
    const latestDraw = await this.drawModel.findOne().sort({ drawTime: -1 });
    const latestDrawHours = latestDraw?.drawTime.getUTCHours();
    const latestDrawMinutes = latestDraw?.drawTime.getUTCMinutes();
    const latestDrawDay = latestDraw?.drawTime.getUTCDay();
    const drawed = await this.lottery.methods.drawed().call();
    const drawingPhase = await this.lottery.methods.drawingPhase().call();
    const currentDate = new Date();
    const currentMinutes = currentDate.getUTCMinutes();
    const currentHour = currentDate.getUTCHours();
    const currentDay = currentDate.getUTCDay();
    const nextLottery = await this.getClosestLotteryHour(currentHour);
    this.logger.log(
      `Processing lottery currentHour ${currentHour} latest draw: ${latestDrawHours} next draw: ${nextLottery}`,
    );
    if (
      !drawed &&
      currentHour === nextLottery &&
      ((latestDrawHours === nextLottery && currentDay != latestDrawDay) ||
        latestDrawHours !== nextLottery)
    ) {
      this.logger.log('Drawing');
      if (currentHour === nextLottery) {
        if (!drawingPhase) {
          await this.enterDrawing();
        }
        await this.draw();
        return 'draw';
      }
    } else if (
      drawed &&
      latestDrawHours === currentHour &&
      currentMinutes + 10 >= latestDrawMinutes
    ) {
      this.logger.log('Resetting');
      await this.reset();
      return 'reset';
    } else {
      this.logger.log('no action');
    }
    return 'No action';
  }

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

  async draw() {
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
    const index = await getIssueIndex();
    await this.drawModel.create({
      index,
      drawTime: new Date(),
    });
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
