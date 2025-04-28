import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateChatDto } from "./dto/create-chat.dto";
import { UpdateChatDto } from "./dto/update-chat.dto";
import { ResponseMessage } from "../../shared/interfaces/response-message";
import { IChatRepository } from "./repositories/chat.repository";
import { Chat } from "./entities/chat.entity";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { InviteService } from "../invite/invite.service";

@Injectable()
export class ChatService {
  public constructor(
    @Inject("ChatRepository") private readonly chatRepository: IChatRepository,
    private readonly userService: UserService,
    private readonly inviteService: InviteService,
  ) {}

  public async create(createChatDto: CreateChatDto): Promise<ResponseMessage> {
    const [admEmail, ...usersEmail] = createChatDto.users;
    const adm = await this.findUser(admEmail);
    const users = await Promise.all(
      usersEmail.map((user) => this.findUser(user)),
    );
    const { id } = await this.chatRepository.create({
      ...createChatDto,
      users: [adm.id],
    });
    await this.inviteService.create({
      name: createChatDto.name,
      chat: id,
      adm,
      users,
    });
    return { message: "Conversa iniciada com sucesso!" };
  }

  public async findById(id: string): Promise<Chat> {
    const chat = await this.chatRepository.findById(id);
    if (!chat) throw new NotFoundException("Conversa não encontrada!");
    return chat;
  }

  public async findManyByUser(user: string): Promise<Chat[]> {
    return await this.chatRepository.findManyByUser(user);
  }

  public async findManyByNameAndUser(
    name: string,
    user: string,
  ): Promise<Chat[]> {
    return await this.chatRepository.findManyByNameAndUser(name, user);
  }

  public async update(
    id: string,
    updateChatDto: UpdateChatDto,
  ): Promise<ResponseMessage> {
    await this.findById(id);
    await this.chatRepository.update(id, updateChatDto);
    return { message: "Conversa atualizada com sucesso!" };
  }

  public async delete(id: string): Promise<ResponseMessage> {
    await this.findById(id);
    await this.chatRepository.delete(id);
    return { message: "Conversa atualizada com sucesso!" };
  }

  public async findUser(user: string): Promise<User> {
    return await this.userService.findByEmail(user);
  }
}
