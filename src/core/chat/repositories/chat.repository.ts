import { CreateChatDto } from "../dto/create-chat.dto";
import { UpdateChatDto } from "../dto/update-chat.dto";
import { Chat } from "../entities/chat.entity";

export interface IChatRepository {
  create(createChatDto: CreateChatDto): Promise<Chat>;
  findById(id: string): Promise<Chat>;
  findManyByUser(user: string): Promise<Chat[]>;
  findManyByNameAndUser(name: string, user: string): Promise<Chat[]>;
  update(id: string, updateChatDto: UpdateChatDto): Promise<Chat>;
  delete(id: string): Promise<Chat>;
}
