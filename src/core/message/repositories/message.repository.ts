import { Message } from "../entities/message.entity";
import { CreateMessageDto } from "./../dto/create-message.dto";

export interface IMessageRepository {
  create(createMessageDto: CreateMessageDto): Promise<Message>;
  findManyByChat(chat: string): Promise<Message[]>;
  findLastest(user: string): Promise<Message[]>;
}
