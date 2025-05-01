import { InjectModel } from "@nestjs/mongoose";
import { Invite } from "../entities/invite.entity";
import { IInviteRepository } from "./invite.repository";
import { Model } from "mongoose";

export class MongoInviteRepository implements IInviteRepository {
  public constructor(
    @InjectModel("Invite") private readonly inviteModel: Model<Invite>,
  ) {}

  public async create(chat: string, user: string): Promise<Invite> {
    return await this.inviteModel.create({ chat, user });
  }

  public async findById(id: string): Promise<Invite> {
    return await this.inviteModel
      .findById(id)
      .populate({
        path: "chat",
      })
      .populate({ path: "user" })
      .exec();
  }

  public async findManyByUser(user: string): Promise<Invite[]> {
    return await this.inviteModel
      .find({ user })
      .populate({
        path: "chat",
      })
      .populate({ path: "user" })
      .sort({ createdAt: -1 })
      .exec();
  }

  public async delete(id: string): Promise<Invite> {
    return await this.inviteModel.findByIdAndDelete(id).exec();
  }
}
