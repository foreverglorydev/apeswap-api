import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApproveIazoDto } from './dto/approveIazo.dto';
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

  @Get('staff/')
  async fetchIazoStaff() {
    return await this.iazoService.fetchIazoStaff();
  }

  @Post('staff/:id/approve')
  async approveIazo(
    @Param('id') iazoId: string,
    @Body() approveIazoDto: ApproveIazoDto,
  ) {
    return await this.iazoService.approveIazo(iazoId, approveIazoDto);
  }

  @Put('staff/:id/tags')
  async updateTagsIazo(@Param('id') iazoId: string, @Body() tags: [string]) {
    return await this.iazoService.updateTagsIazo(iazoId, tags);
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
