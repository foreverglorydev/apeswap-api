import {
  CacheInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApestrongDocument } from './schema/apestrong.schema';
import { ApestrongService } from './apestrong.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('apestrong')
@UseInterceptors(CacheInterceptor)
export class ApestrongController {
  private readonly logger = new Logger(ApestrongController.name);
  constructor(private apestrongService: ApestrongService) {}

  @ApiExcludeEndpoint()
  @Get(':id')
  async getApestrongByIndex(
    @Param('id') id: number,
  ): Promise<ApestrongDocument> {
    this.logger.debug('Called GET /apestrong/:id');
    return this.apestrongService.getApestrongByIndex(id);
  }
}
