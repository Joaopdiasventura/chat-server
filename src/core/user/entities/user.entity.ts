import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false, timestamps: true })
export class User extends Document<string, User, User> {
  @Prop({ required: true, unique: true })
  public email: string;

  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public password: string;

  @Prop({ default: "red" })
  public color: string;

  @Prop({ default: false })
  public isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
