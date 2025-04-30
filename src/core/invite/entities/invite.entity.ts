import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { User } from "../../user/entities/user.entity";
import { Chat } from "../../chat/entities/chat.entity";

@Schema({ versionKey: false, timestamps: true })
export class Invite extends Document {
  @Prop({ required: true, type: String, ref: "User" })
  public user: string | User;

  @Prop({ required: true, type: String, ref: "Chat" })
  public chat: string | Chat;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
