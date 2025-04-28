import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { MessageSchema } from "./entities/message.entity";
import { UserModule } from "../user/user.module";
import { ChatModule } from "../chat/chat.module";
import { MongoMessageRepository } from "./repositories/message.mongo.repository";
import { MessageGateway } from "./message.gateway";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }]),
    UserModule,
    ChatModule,
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    MessageGateway,
    { provide: "MessageRepository", useClass: MongoMessageRepository },
  ],
})
export class MessageModule {}
