import { InjectModel } from "@nestjs/mongoose";
import { CreateChatDto } from "../dto/create-chat.dto";
import { UpdateChatDto } from "../dto/update-chat.dto";
import { Chat } from "../entities/chat.entity";
import { IChatRepository } from "./chat.repository";
import { Model } from "mongoose";

export class MongoChatRepository implements IChatRepository {
  public constructor(
    @InjectModel("Chat") private readonly chatModel: Model<Chat>,
  ) {}

  public async create(createChatDto: CreateChatDto): Promise<Chat> {
    return await this.chatModel.create(createChatDto);
  }

  public async findById(id: string): Promise<Chat> {
    return await this.chatModel.findById(id).exec();
  }

  public async findManyByUser(user: string): Promise<Chat[]> {
    return await this.chatModel
      .find({ users: { $regex: user, $options: "i" } })
      .populate({
        path: "users",
        select: "name email color",
      })
      .sort({ name: 1 })
      .exec();
  }

  public async findManyByNameAndUser(
    user: string,
    name: string,
  ): Promise<Chat[]> {
    return this.chatModel
      .aggregate<Chat>([
        { $match: { users: { $regex: user, $options: "i" } } },
        {
          $addFields: {
            users: {
              $map: {
                input: "$users",
                as: "u",
                in: { $toObjectId: "$$u" },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "users",
            foreignField: "_id",
            as: "users",
            pipeline: [{ $project: { name: 1, email: 1, color: 1 } }],
          },
        },
        {
          $match: {
            $or: [
              { name: { $regex: name, $options: "i" } },
              { "users.name": { $regex: name, $options: "i" } },
              { "users.email": { $regex: name, $options: "i" } },
            ],
          },
        },
        { $sort: { name: 1 } },
      ])
      .exec();
  }

  public async update(id: string, updateChatDto: UpdateChatDto): Promise<Chat> {
    return await this.chatModel.findByIdAndUpdate(id, updateChatDto).exec();
  }

  public async delete(id: string): Promise<Chat> {
    return await this.chatModel.findByIdAndDelete(id).exec();
  }
}
