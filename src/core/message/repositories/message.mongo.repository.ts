import { CreateMessageDto } from "../dto/create-message.dto";
import { Message } from "../entities/message.entity";
import { IMessageRepository } from "./message.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

export class MongoMessageRepository implements IMessageRepository {
  public constructor(
    @InjectModel("Message") private readonly messageModel: Model<Message>,
  ) {}

  public async create(createMessageDto: CreateMessageDto): Promise<Message> {
    return await this.messageModel.create(createMessageDto);
  }

  public async findManyByChat(chat: string): Promise<Message[]> {
    return await this.messageModel
      .find({ chat })
      .populate({ path: "user", select: "name email color" })
      .exec();
  }

  public async findLastest(user: string): Promise<Message[]> {
    return this.messageModel
      .aggregate<Message>([
        {
          $addFields: {
            chatObj: { $toObjectId: "$chat" },
          },
        },
        {
          $lookup: {
            from: "chats",
            let: { chatId: "$chatObj" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$chatId"] } } },

              { $match: { users: { $regex: user, $options: "i" } } },
            ],
            as: "chatInfo",
          },
        },
        { $unwind: "$chatInfo" },
        { $project: { chatObj: 0, chatInfo: 0 } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$chat",
            message: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$message" } },

        { $addFields: { user: { $toObjectId: "$user" } } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [{ $project: { name: 1, email: 1 } }],
          },
        },
        { $unwind: "$user" },
        { $sort: { createdAt: -1 } },
      ])
      .exec();
  }
}
