import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PairsModule } from './pairs/pairs.module';
import { LotteryModule } from './lottery/lottery.module';
import { StatsModule } from './stats/stats.module';
import { NfasModule } from './nfas/nfas.module';
import { ApestrongModule } from './apestrong/apestrong.module';
import configuration from './config/configuration';
import { TradingModule } from './trading/trading.module';
import { IazoModule } from './iazo/iazo.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { Cloudinary } from './cloudinary/cloudinary';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.development.env', '.env'],
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, { useCreateIndex: true }),
    PairsModule,
    LotteryModule,
    StatsModule,
    NfasModule,
    TradingModule,
    ApestrongModule,
    IazoModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService, Cloudinary],
})
export class AppModule {}
