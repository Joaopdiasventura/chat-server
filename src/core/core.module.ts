import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { ChatModule } from './chat/chat.module';
import { InviteModule } from './invite/invite.module';

@Module({ imports: [UserModule, ChatModule, InviteModule] })
export class CoreModule {}
