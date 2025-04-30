import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { User } from "../../user/entities/user.entity";

@Schema({ versionKey: false, timestamps: true })
export class Chat extends Document<string, Chat, Chat> {
  @Prop({ required: false })
  public name?: string;

  @Prop({ required: true, type: [String], ref: "User" })
  public users: string[] | User[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
