import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApproveIazoDto } from './dto/approveIazo.dto';
import { IazoDto } from './dto/iazo.dto';
import { IazoTagDto } from './dto/iazoTag.dto';
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

  @Post('staff/:id/tag')
  async addTagIazo(@Param('id') iazoId: string, @Body() tag: IazoTagDto) {
    return await this.iazoService.addTagIazo(iazoId, tag);
  }

  @Put('staff/:id/tag/:tagId')
  async updateTagIazo(
    @Param('id') iazoId: string,
    @Body() tag: IazoTagDto,
    @Param('tagId') tagId: number,
  ) {
    return await this.iazoService.updateTagIazo(iazoId, tag, tagId);
  }

  @Delete('staff/:id/tag/:tagId')
  async removeTagIazo(
    @Param('id') iazoId: string,
    @Param('tagId') tagId: number,
  ) {
    return await this.iazoService.removeTagIazo(iazoId, tagId);
  }

  @Get(':address')
  async getIazo(@Param('address') address: string) {
    return await this.iazoService.getIazoByAddress(address);
  }

  @Get('owner/:address')
  async getIaozUser(@Param('address') address: string) {
    return await this.iazoService.getIaozUser(address);
  }

  @Get('detail/:id')
  async getDetailIaoz(@Param('id') id: string) {
    return await this.iazoService.detailIaoz(id);
  }
}
