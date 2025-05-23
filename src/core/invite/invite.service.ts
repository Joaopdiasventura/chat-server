import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateInviteDto } from "./dto/create-invite.dto";
import { IInviteRepository } from "./repositories/invite.repository";
import { EmailService } from "../../shared/services/email/email.service";
import { ChatService } from "../chat/chat.service";
import { InviteGateway } from "./invite.gateway";
import { ResponseMessage } from "../../shared/interfaces/response-message";
import { UpdateChatDto } from "../chat/dto/update-chat.dto";
import { Invite } from "./entities/invite.entity";
import { UserService } from "../user/user.service";
import { Chat } from "../chat/entities/chat.entity";

@Injectable()
export class InviteService {
  public constructor(
    @Inject("InviteRepository")
    private readonly inviteRepository: IInviteRepository,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly inviteGateway: InviteGateway,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  public async create(createInviteDto: CreateInviteDto): Promise<void> {
    const subject = createInviteDto.name
      ? `Você recebeu um convite para o grupo ${createInviteDto.name}`
      : `Você recebeu um convite para conversar com ${createInviteDto.adm.name} - ${createInviteDto.adm.email}`;
    for (const user of createInviteDto.users) {
      if (!user.isVerified) continue;
      const { id } = await this.inviteRepository.create(
        createInviteDto.chat,
        user.id,
      );
      await this.emailService.sendEmail({
        subject,
        to: user.email,
        html: `<p>Para aceitar o convite, clique <a href="${this.configService.get<string>("client.url")}/?findInvites=true">aqui</a></p>`,
      });
      this.inviteGateway.createInvite(user.email, await this.findById(id));
    }
  }

  public async findById(id: string): Promise<Invite> {
    const invite = await this.inviteRepository.findById(id);
    if (!invite) throw new NotFoundException("Convite não encontrado!");
    return invite;
  }

  public findManyByUser(user: string): Promise<Invite[]> {
    return this.inviteRepository.findManyByUser(user);
  }

  public async acceptInvite(id: string): Promise<Chat> {
    const invite = await this.findById(id);
    if (!invite) throw new NotFoundException("Convite não encontrado!");
    const chat = await this.chatService.findById(invite.chat as string);
    const user = await this.userService.findById(invite.user as string);
    (chat.users as string[]).push(invite.user as string);
    this.inviteGateway.enterChat(user, chat);
    await this.chatService.update(chat._id, chat as UpdateChatDto);
    await this.inviteRepository.delete(id);
    return chat;
  }

  public async delete(id: string): Promise<ResponseMessage> {
    await this.findById(id);
    await this.inviteRepository.delete(id);
    return { message: "Convite removido com sucesso!" };
  }
}
