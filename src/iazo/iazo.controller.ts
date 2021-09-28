import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IazoDto } from './dto/iazo.dto';
import { IazoService } from './iazo.service';

@Controller('iazo')
export class IazoController {
  constructor(private iazoService: IazoService) {}

  @Post('')
  async createIazo(@Body() iazoDto: IazoDto) {
    await this.iazoService.createIazo(iazoDto);
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
