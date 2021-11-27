import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NfasAuctionService } from './nfas/nfas-auction.service';
import { NfasTrackingService } from './nfas/nfas-tracking.service';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const trackingService = app.get(NfasTrackingService);
  const auctionService = app.get(NfasAuctionService);
  trackingService.listenToEvents();
  auctionService.listenToEvents();
  const config = new DocumentBuilder()
    .setTitle('Api Apeswap')
    .setDescription('Apeswap services')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
