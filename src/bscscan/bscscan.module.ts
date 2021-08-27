import { HttpModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { BscscanService } from './bscscan.service';

@Module({
  imports: [HttpModule],
  providers: [BscscanService],
  exports: [BscscanService],
})
export class BscscanModule {}
