import { Controller, Get, Param, Logger } from '@nestjs/common';
import { Nfa } from './interfaces/nfas.interface';
import { NfasService } from './nfas.service';

@Controller('nfas')
export class NfasController {
  private readonly logger = new Logger(NfasController.name);
  constructor(private nfasService: NfasService) {}

  @Get()
  async getAllNfas(): Promise<Nfa[]> {
    this.logger.debug('Called GET /nfas');
    return await this.nfasService.getAllNfas();
  }

  @Get('address/:address')
  async getNfasByAddress(
    @Param('address') address: string,
  ): Promise<Nfa[] | null> {
    this.logger.debug('Called GET /nfas/address/:address');
    return await this.nfasService.getNfasByAddress(address);
  }

  @Get(':index')
  async getNfasByIndex(@Param('index') index: number): Promise<Nfa | null> {
    this.logger.debug('Called GET /nfas/:index');
    return await this.nfasService.getNfasByIndex(index);
  }
}
