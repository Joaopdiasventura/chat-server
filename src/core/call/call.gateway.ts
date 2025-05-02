import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { BodyCallDto } from "./dto/body-call.dto";

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
  },
})
export class CallGateway {
  @WebSocketServer()
  private server: Server;

  private showCameraStatus: Record<string, Map<string, BodyCallDto>> = {};

  public handleConnection(client: Socket): void {
    const callId = client.handshake.query.call as string;
    if (!callId) return;
    client.join(callId);
    if (!this.showCameraStatus[callId]) {
      this.showCameraStatus[callId] = new Map();
    }
    const room = this.server.sockets.adapter.rooms.get(callId) || new Set();
    room.forEach((id) => {
      if (id != client.id) {
        client.emit("existing-user", id);
        const dto = this.showCameraStatus[callId].get(id) || { enabled: false };
        client.emit("toggle-video", { userId: id, ...dto });
      }
    });
    client.broadcast.to(callId).emit("user-connected", client.id);
  }

  public handleDisconnect(client: Socket): void {
    const callId = client.handshake.query.call as string;
    client.broadcast.to(callId).emit("user-disconnected", client.id);
    client.leave(callId);
    const map = this.showCameraStatus[callId];
    if (map) map.delete(client.id);
  }

  @SubscribeMessage("offer")
  public handleOffer(
    @ConnectedSocket() c: Socket,
    @MessageBody() p: { offer: never; to: string },
  ): void {
    c.to(p.to).emit("offer", { offer: p.offer, from: c.id });
  }

  @SubscribeMessage("answer")
  public handleAnswer(
    @ConnectedSocket() c: Socket,
    @MessageBody() p: { answer: never; to: string },
  ): void {
    c.to(p.to).emit("answer", { answer: p.answer, from: c.id });
  }

  @SubscribeMessage("candidate")
  public handleCandidate(
    @ConnectedSocket() c: Socket,
    @MessageBody() p: { candidate: never; to: string },
  ): void {
    c.to(p.to).emit("candidate", { candidate: p.candidate, from: c.id });
  }

  @SubscribeMessage("toggle-video")
  public handleToggleVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: BodyCallDto,
  ): void {
    const callId = client.handshake.query.call as string;
    if (!this.showCameraStatus[callId])
      this.showCameraStatus[callId] = new Map();
    this.showCameraStatus[callId].set(client.id, {
      enabled: body.enabled,
      name: body.name,
      color: body.color,
    });
    client.to(callId).emit("toggle-video", {
      userId: client.id,
      enabled: body.enabled,
      name: body.name,
      color: body.color,
    });
  }
}
