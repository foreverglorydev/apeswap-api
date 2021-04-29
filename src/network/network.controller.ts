import { Controller, Get, Logger } from '@nestjs/common';
import { NetworkService } from './network.service';

@Controller('network')
export class NetworkController {
  private readonly logger = new Logger(NetworkController.name);
  constructor(private networkService: NetworkService) {}
  @Get()
  async getNetworkStatus(): Promise<any> {
    this.logger.debug('Called GET /network');
    return await this.networkService.getStatus();
  }
}
