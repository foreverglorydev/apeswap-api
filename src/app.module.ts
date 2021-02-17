import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PairsModule } from './pairs/pairs.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.development.env', '.env'],
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, { useCreateIndex: true }),
    PairsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
