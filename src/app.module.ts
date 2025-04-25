import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app.config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [AppConfig] })],
  controllers: [],
  providers: [],
})
export class AppModule {}
