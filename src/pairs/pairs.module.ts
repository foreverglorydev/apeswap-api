import { HttpModule, Module } from '@nestjs/common';
import { PairsService } from './pairs.service';

@Module({
  imports: [HttpModule],
  providers: [PairsService],
})
export class PairsModule {}
