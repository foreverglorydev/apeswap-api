import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  Post,
  Body,
} from '@nestjs/common';
import { NfaSaleDto } from './dto/nfaSale.dto';
import { Nfa } from './interfaces/nfas.interface';
import { NfasTrackingService } from './nfas-tracking.service';
import { NfasService } from './nfas.service';

@Controller('nfas')
export class NfasController {
  private readonly logger = new Logger(NfasController.name);
  constructor(
    private nfasService: NfasService,
    private nfaTracking: NfasTrackingService,
  ) {}

  @Get()
  async getAllNfas(@Query() query): Promise<Nfa[]> {
    this.logger.debug('Called GET /nfas');
    return await this.nfasService.getAllNfas(query);
  }

  @Get('address/:address')
  async getNfasByAddress(
    @Param('address') address: string,
    @Query() query,
  ): Promise<Nfa[] | null> {
    this.logger.debug('Called GET /nfas/address/:address');
    return await this.nfasService.getNfasByAddress(address, query);
  }

  @Get('process/:startBlock')
  async processEvents(@Param('startBlock') startBlock: string): Promise<any> {
    this.logger.debug('Called GET /nfas/process/:startBlock');
    this.nfaTracking.fetchLogs({ startBlock: parseInt(startBlock, 10) });
  }

  @Get('currentSales')
  async fetchLastBlockLogs() {
    this.logger.debug('Called GET /nfas/currentSales');
    this.nfaTracking.fetchLastBlockLogs();
  }

  @Get('transactions/:index')
  async getNfaTransactions(@Param('index') index: number): Promise<any> {
    this.logger.debug('Called GET /nfas/history/:index');
    return await this.nfaTracking.getNfaTransactions(index);
  }

  @Get('history/:index')
  async getNfaSellHistory(@Param('index') index: number): Promise<any> {
    this.logger.debug('Called GET /nfas/history/:index');
    return await this.nfaTracking.getNfaSellHistory(index);
  }

  @Get('transactions/descBlock/:index')
  async getNfaTransactionHistoryDescendingBlock(
    @Param('index') index: number,
  ): Promise<any> {
    this.logger.debug('Called GET /nfas/transactions/descBlock/:index');
    return await this.nfaTracking.getNfaTransactionHistoryDescendingBlock(
      index,
    );
  }

  @Get(':index')
  async getNfasByIndex(@Param('index') index: number): Promise<Nfa | null> {
    this.logger.debug('Called GET /nfas/:index');
    return await this.nfasService.getNfasByIndex(index);
  }

  @Post('sale')
  async nfaSale(@Body() nfaSale: NfaSaleDto) {
    await this.nfasService.nfaSale(nfaSale);
    return nfaSale;
  }

  @Post('init')
  async initData(): Promise<Nfa[] | null> {
    this.logger.debug('Called GET /nfas/init');
    return await this.nfasService.initData();
  }
}
