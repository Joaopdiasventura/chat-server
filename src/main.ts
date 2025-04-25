import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app =
    await NestFactory.create<INestApplication<ExpressAdapter>>(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
