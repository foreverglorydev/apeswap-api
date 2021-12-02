import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  Post,
  Body,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NfaBid } from './dto/nfaBid.dto';
import { NfaSaleDto } from './dto/nfaSale.dto';
import { NfaSell } from './dto/nfaSell.dto';
import { Nfa } from './interfaces/nfas.interface';
import { NfasAuctionService } from './nfas-auction.service';
import { NfasTrackingService } from './nfas-tracking.service';
import { NfasService } from './nfas.service';
import { NfaAuctionDocument } from './schema/nfa-auction.schema';

@ApiTags('nfas')
@Controller('nfas')
export class NfasController {
  private readonly logger = new Logger(NfasController.name);
  constructor(
    private nfasService: NfasService,
    private nfaTracking: NfasTrackingService,
    private nfaAuction: NfasAuctionService,
  ) {}

  @ApiExcludeEndpoint()
  @Get()
  async getAllNfas(@Query() query): Promise<Nfa[]> {
    this.logger.debug('Called GET /nfas');
    return await this.nfasService.getAllNfas(query);
  }

  @ApiExcludeEndpoint()
  @Get('address/:address')
  async getNfasByAddress(
    @Param('address') address: string,
    @Query() query,
  ): Promise<Nfa[] | null> {
    this.logger.debug('Called GET /nfas/address/:address');
    return await this.nfasService.getNfasByAddress(address, query);
  }

  @ApiExcludeEndpoint()
  @Get('process/:startBlock')
  async processEvents(@Param('startBlock') startBlock: string): Promise<any> {
    this.logger.debug('Called GET /nfas/process/:startBlock');
    this.nfaTracking.fetchLogs({ startBlock: parseInt(startBlock, 10) });
  }

  @ApiExcludeEndpoint()
  @Get('currentSales')
  async fetchLastBlockLogs() {
    this.logger.debug('Called GET /nfas/currentSales');
    this.nfaTracking.fetchLastBlockLogs();
  }

  @ApiExcludeEndpoint()
  @Get('currentBids')
  async fetchLastBids() {
    this.logger.debug('Called GET /nfas/currentBids');
    this.nfaAuction.fetchLastBlockLogs();
  }

  @ApiOkResponse({
    type: [NfaBid]
  })
  @Get('latestBids')
  @UseInterceptors(CacheInterceptor)
  async getLastBids(): Promise<NfaAuctionDocument[]> {
    this.logger.debug('Called GET /nfas/latestBids');
    return this.nfaAuction.getAuctionHistory();
  }

  @ApiOkResponse({
    type: [NfaBid]
  })
  @Get('bids/:index')
  async getNfaBods(@Param('index') index: number): Promise<any> {
    this.logger.debug('Called GET /nfas/bids/:index');
    return await this.nfaAuction.getNfaAuctionHistory(index);
  }

  @ApiOkResponse({
    type: [NfaBid]
  })
  @Get('transactions/:index')
  async getNfaTransactions(@Param('index') index: number): Promise<any> {
    this.logger.debug('Called GET /nfas/history/:index');
    return await this.nfaTracking.getNfaTransactions(index);
  }

  @ApiOkResponse({
    type: [NfaSell]
  })
  @Get('history/:index')
  async getNfaSellHistory(@Param('index') index: number): Promise<any> {
    this.logger.debug('Called GET /nfas/history/:index');
    return await this.nfaTracking.getNfaSellHistory(index);
  }

  @ApiOkResponse({
    type: [NfaSell]
  })
  @Get('transactions/descBlock/:index')
  async getNfaTransactionHistoryDescendingBlock(
    @Param('index') index: number,
  ): Promise<any> {
    this.logger.debug('Called GET /nfas/transactions/descBlock/:index');
    return await this.nfaTracking.getNfaTransactionHistoryDescendingBlock(
      index,
    );
  }

  @ApiExcludeEndpoint()
  @Get(':index')
  async getNfasByIndex(@Param('index') index: number): Promise<Nfa | null> {
    this.logger.debug('Called GET /nfas/:index');
    return await this.nfasService.getNfasByIndex(index);
  }

  @ApiExcludeEndpoint()
  @Post('sale')
  async nfaSale(@Body() nfaSale: NfaSaleDto) {
    await this.nfasService.nfaSale(nfaSale);
    return nfaSale;
  }

  @ApiExcludeEndpoint()
  @Post('init')
  async initData(): Promise<Nfa[] | null> {
    this.logger.debug('Called GET /nfas/init');
    return await this.nfasService.initData();
  }
}
