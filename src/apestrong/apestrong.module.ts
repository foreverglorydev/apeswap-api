import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { ApestrongService } from '../apestrong/apestrong.service';
import { Apestrong, ApestrongSchema } from './schema/apestrong.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsModule } from 'src/stats/stats.module';
import { ApestrongController } from './apestrong.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    StatsModule,
    MongooseModule.forFeature([
      { name: Apestrong.name, schema: ApestrongSchema },
    ]),
  ],
  providers: [ApestrongService],
  controllers: [ApestrongController],
})
export class ApestrongModule {}
