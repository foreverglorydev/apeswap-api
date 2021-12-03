import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NfasAuctionService } from './nfas/nfas-auction.service';
import { NfasTrackingService } from './nfas/nfas-tracking.service';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as Sentry from '@sentry/node';

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
  Sentry.init({
    dsn: 'https://5bf636b44d6c468fbc66200265fa9e5d@o1079316.ingest.sentry.io/6083993',
    environment: 'develop'
  });
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
