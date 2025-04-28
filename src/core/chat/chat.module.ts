import { forwardRef, Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatSchema } from "./entities/chat.entity";
import { MongoChatRepository } from "./repositories/chat.mongo.repository";
import { UserModule } from "../user/user.module";
import { InviteModule } from "../invite/invite.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Chat", schema: ChatSchema }]),
    UserModule,
    forwardRef(() => InviteModule),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    { provide: "ChatRepository", useClass: MongoChatRepository },
  ],
  exports: [ChatService],
})
export class ChatModule {}
