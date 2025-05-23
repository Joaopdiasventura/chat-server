import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { User } from "../user/entities/user.entity";
import { Chat } from "../chat/entities/chat.entity";
import { Invite } from "./entities/invite.entity";

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
  },
})
export class InviteGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly userConnections = new Map<string, string[]>();

  public handleConnection(client: Socket): void {
    const userEmail = client.handshake.query.email as string;
    const socketIds = this.userConnections.get(userEmail);
    this.userConnections.set(
      userEmail,
      socketIds ? [...socketIds, client.id] : [client.id],
    );
  }

  public handleDisconnect(client: Socket): void {
    this.userConnections.forEach((socketIds, userEmail) => {
      const index = socketIds.indexOf(client.id);
      if (index != -1) {
        socketIds.splice(index, 1);
        if (socketIds.length == 0) this.userConnections.delete(userEmail);
        else this.userConnections.set(userEmail, socketIds);
      }
    });
  }

  public createInvite(email: string, invite: Invite): void {
    const socketIds = this.userConnections.get(email);
    if (socketIds)
      for (const socketId of socketIds)
        this.server.to(socketId).emit("invite-created", invite);
  }

  public enterChat(user: User, chat: Chat): void {
    for (const participant of chat.users) {
      const socketIds = this.userConnections.get((participant as User).email);
      if (socketIds)
        for (const socketId of socketIds)
          this.server.to(socketId).emit("enter-chat", { user });
    }
  }
}
