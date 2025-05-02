import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { ChatModule } from './chat/chat.module';
import { InviteModule } from './invite/invite.module';
import { MessageModule } from './message/message.module';
import { CallModule } from './call/call.module';

@Module({ imports: [UserModule, ChatModule, InviteModule, MessageModule, CallModule] })
export class CoreModule {}
