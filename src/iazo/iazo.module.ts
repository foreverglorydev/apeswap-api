import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IazoController } from './iazo.controller';
import { IazoService } from './iazo.service';
import { Iazo, IazoSchema } from './schema/iazo.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    MongooseModule.forFeature([{ name: Iazo.name, schema: IazoSchema }]),
  ],
  controllers: [IazoController],
  providers: [IazoService],
})
export class IazoModule {}
