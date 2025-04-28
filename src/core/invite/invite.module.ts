import { MongooseModule } from "@nestjs/mongoose";
import { forwardRef, Module } from "@nestjs/common";
import { InviteService } from "./invite.service";
import { InviteGateway } from "./invite.gateway";
import { InviteController } from "./invite.controller";
import { InviteSchema } from "./entities/invite.entity";
import { UserModule } from "../user/user.module";
import { ChatModule } from "../chat/chat.module";
import { EmailModule } from "src/shared/services/email/email.module";
import { MongoInviteRepository } from "./repositories/invite.mongo.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Invite", schema: InviteSchema }]),
    UserModule,
    EmailModule,
    forwardRef(() => ChatModule),
  ],
  controllers: [InviteController],
  providers: [
    InviteService,
    InviteGateway,
    { provide: "InviteRepository", useClass: MongoInviteRepository },
  ],
  exports: [InviteService],
})
export class InviteModule {}
