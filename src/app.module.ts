import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppConfig } from "./config/app.config";
import { DbConfig } from "./config/db.config";
import { CoreModule } from "./core/core.module";
import { EmailModule } from './shared/services/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [AppConfig, DbConfig] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("mongo.uri"),
      }),
    }),
    CoreModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
