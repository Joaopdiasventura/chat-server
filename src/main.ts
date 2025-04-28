import { NestFactory } from "@nestjs/core";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app =
    await NestFactory.create<INestApplication<ExpressAdapter>>(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const corsOptions = {
    origin: configService.get("client.url"),
    methods: ["GET", "DELETE", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors(corsOptions);

  await app.listen(configService.get<number>("port"));
}
bootstrap();
