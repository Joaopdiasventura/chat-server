import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false, timestamps: true })
export class Invite extends Document {
  @Prop({ required: true, type: String, ref: "User" })
  public user: string;

  @Prop({ required: true, type: String, ref: "Chat" })
  public chat: string;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
