import { Module, HttpModule } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [HttpModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
