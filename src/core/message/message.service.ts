import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateMessageDto } from "./dto/create-message.dto";
import { IMessageRepository } from "./repositories/message.repository";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { ChatService } from "../chat/chat.service";
import { Chat } from "../chat/entities/chat.entity";
import { Message } from "./entities/message.entity";
import { MessageGateway } from "./message.gateway";

@Injectable()
export class MessageService {
  public constructor(
    @Inject("MessageRepository")
    private readonly messageRepository: IMessageRepository,
    private readonly messageGateway: MessageGateway,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  public async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const user = await this.findUser(createMessageDto.user);
    const chat = await this.findChat(createMessageDto.chat);

    if (!this.userInChat(chat.users as User[], createMessageDto.user))
      throw new BadRequestException("Você não faz parte dessa conversa");

    const message = await this.messageRepository.create(createMessageDto);
    message.user = user;
    message.chat = chat;
    this.messageGateway.sendMessage(chat, message);
    return message;
  }

  public async findManyByChat(chat: string): Promise<Message[]> {
    return await this.messageRepository.findManyByChat(chat);
  }

  public async findLastest(user: string): Promise<Message[]> {
    return await this.messageRepository.findLastest(user);
  }

  private async findUser(user: string): Promise<User> {
    return await this.userService.findById(user);
  }

  private async findChat(chat: string): Promise<Chat> {
    return await this.chatService.findById(chat);
  }

  private userInChat(users: User[], user: string): boolean {
    for (let i = 0; i < users.length; i++)
      if (users[i]._id == user) return true;
    return false;
  }
}
