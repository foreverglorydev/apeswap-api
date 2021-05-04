import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NfasTrackingService } from './nfas/nfas-tracking.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const trackingService = app.get(NfasTrackingService);
  trackingService.listenToEvents();
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
