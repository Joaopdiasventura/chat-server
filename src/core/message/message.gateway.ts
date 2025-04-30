import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Chat } from "../chat/entities/chat.entity";
import { Message } from "./entities/message.entity";
import { User } from "../user/entities/user.entity";

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
  },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
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

  public sendMessage(chat: Chat, message: Message): void {
    for (const participant of chat.users) {
      const socketIds = this.userConnections.get((participant as User).email);
      if (socketIds)
        for (const socketId of socketIds)
          this.server.to(socketId).emit("message", message);
    }
  }
}
