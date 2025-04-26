import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "./user.service";
import { UserGateway } from "./user.gateway";
import { UserController } from "./user.controller";
import { UserSchema } from "./entities/user.entity";
import { MongoUserRepository } from "./repositories/user.mongo.repository";
import { AuthModule } from "../../shared/services/auth/auth.module";
import { EmailModule } from "../../shared/services/email/email.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    AuthModule,
    EmailModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserGateway,
    { provide: "UserRepository", useClass: MongoUserRepository },
  ],
  exports: [UserService],
})
export class UserModule {}
