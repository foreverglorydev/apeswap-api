import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PairsModule } from './pairs/pairs.module';

@Module({
  imports: [PairsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
