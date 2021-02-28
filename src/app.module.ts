import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PairsModule } from './pairs/pairs.module';
import { LotteryModule } from './lottery/lottery.module';
import configuration from './config/configuration';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
