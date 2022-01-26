import { Module, HttpModule } from '@nestjs/common';
import { BitqueryController } from './bitquery.controller';
import { BitqueryService } from './bitquery.service';

@Module({
  imports: [HttpModule],  
  providers: [BitqueryService],
  controllers: [BitqueryController],
})
export class BitqueryModule {}