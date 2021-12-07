import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IazoController } from './iazo.controller';
import { IazoService } from './iazo.service';
import { Iazo, IazoSchema } from './schema/iazo.schema';
import { CloudinaryModule } from '../services/cloudinary/cloudinary.module';
import { MailgunModule } from 'src/services/mailgun/mailgun.module';
import { ChainConfigService } from 'src/config/chain.configuration.service';
@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    MongooseModule.forFeature([{ name: Iazo.name, schema: IazoSchema }]),
    CloudinaryModule,
    MailgunModule,
  ],
  controllers: [IazoController],
  providers: [IazoService, ChainConfigService],
})
export class IazoModule {}
