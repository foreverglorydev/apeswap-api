import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IazoDto } from './dto/iazo.dto';
import { IazoService } from './iazo.service';

@Controller('iazo')
export class IazoController {
  constructor(private iazoService: IazoService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async createIazo(
    @Body() iazoDto: IazoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.iazoService.createIazo(iazoDto, file);
    return iazoDto;
  }

  @Get('')
  async fetchIaozs() {
    return await this.iazoService.fetchIaozs();
  }

  @Get(':address')
  async getIaozUser(@Param('address') address: string) {
    return await this.iazoService.getIaozUser(address);
  }

  @Get('detail/:id')
  async getDetailIaoz(@Param('id') id: string) {
    return await this.iazoService.detailIaoz(id);
  }
}
