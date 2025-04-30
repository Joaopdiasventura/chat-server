import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { InviteService } from "../invite.service";
import { IInviteRepository } from "../repositories/invite.repository";
import { ChatService } from "../../chat/chat.service";
import { InviteGateway } from "../invite.gateway";
import { EmailService } from "../../../shared/services/email/email.service";
import { ConfigService } from "@nestjs/config";
import { CreateInviteDto } from "../dto/create-invite.dto";
import { UpdateChatDto } from "../../chat/dto/update-chat.dto";
import { Invite } from "../entities/invite.entity";
import { User } from "../../user/entities/user.entity";
import { Chat } from "../../chat/entities/chat.entity";
import { UserService } from "../../user/user.service";

describe("InviteService", () => {
  let service: InviteService;
  let inviteRepo: jest.Mocked<IInviteRepository>;
  let chatService: jest.Mocked<ChatService>;
  let inviteGateway: jest.Mocked<InviteGateway>;
  let emailService: jest.Mocked<EmailService>;

  const mockAdm: User = {
    id: "adm-id",
    name: "Admin",
    email: "adm@e.com",
  } as unknown as User;

  const user1 = {
    id: "u1",
    email: "u1@e.com",
    isVerified: true,
  } as unknown as User;

  const user2 = {
    id: "u2",
    email: "u2@e.com",
    isVerified: false,
  } as unknown as User;

  const user3 = {
    id: "u3",
    email: "u3@e.com",
    isVerified: true,
  } as unknown as User;

  const mockInvite: Invite = {
    _id: "invite-id",
    chat: "chat-id",
    user: "u1",
  } as unknown as Invite;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        {
          provide: "InviteRepository",
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findManyByUser: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ChatService,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: InviteGateway,
          useValue: {
            createInvite: jest.fn(),
            enterChat: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("http://app.test"),
          },
        },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    inviteRepo = module.get("InviteRepository");
    chatService = module.get(ChatService);
    inviteGateway = module.get(InviteGateway);
    emailService = module.get(EmailService);
  });

  it("should be defined", () => expect(service).toBeDefined());

  describe("create", () => {
    it("should call repository, emailService and gateway for each verified user", async () => {
      const dto: CreateInviteDto = {
        name: "Grupo",
        chat: "chat-id",
        adm: mockAdm,
        users: [user1, user2, user3],
      };

      const subject = `Você recebeu um convite para o grupo Grupo`;

      await service.create(dto);

      expect(inviteRepo.create).toHaveBeenCalledTimes(2);
      expect(inviteRepo.create).toHaveBeenNthCalledWith(1, "chat-id", "u1");
      expect(inviteRepo.create).toHaveBeenNthCalledWith(2, "chat-id", "u3");

      expect(emailService.sendEmail).toHaveBeenCalledTimes(2);
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        subject,
        to: "u1@e.com",
        html: `<p>Para aceitar o convite, clique <a href="http://app.test">aqui</a></p>`,
      });
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        subject,
        to: "u3@e.com",
        html: `<p>Para aceitar o convite, clique <a href="http://app.test">aqui</a></p>`,
      });

      expect(inviteGateway.createInvite).toHaveBeenCalledTimes(2);
      expect(inviteGateway.createInvite).toHaveBeenNthCalledWith(
        1,
        "u1@e.com",
        mockAdm,
        "chat-id",
      );
      expect(inviteGateway.createInvite).toHaveBeenNthCalledWith(
        2,
        "u3@e.com",
        mockAdm,
        "chat-id",
      );
    });
  });

  describe("findById", () => {
    it("should return invite if found", async () => {
      inviteRepo.findById.mockResolvedValue(mockInvite);
      const inv = await service.findById("invite-id");
      expect(inv).toBe(mockInvite);
    });

    it("should throw if invite not found", async () => {
      inviteRepo.findById.mockResolvedValue(null);
      await expect(service.findById("bad")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("findManyByUser", () => {
    it("should return list of invites", async () => {
      const list = [mockInvite];
      inviteRepo.findManyByUser.mockResolvedValue(list);
      const res = await service.findManyByUser("u1");
      expect(inviteRepo.findManyByUser).toHaveBeenCalledWith("u1");
      expect(res).toBe(list);
    });
  });

  describe("acceptInvite", () => {
    it("should accept, update chat and delete invite", async () => {
      inviteRepo.findById.mockResolvedValue(mockInvite);
      const chat = { _id: "chat-id", users: ["x"] } as unknown as Chat;
      chatService.findById.mockResolvedValue(chat);
      chatService.update.mockResolvedValue({ message: "" });

      const res = await service.acceptInvite("invite-id");

      expect(inviteRepo.findById).toHaveBeenCalledWith("invite-id");
      expect(chatService.findById).toHaveBeenCalledWith("chat-id");
      expect(chatService.update).toHaveBeenCalledWith("chat-id", {
        _id: "chat-id",
        users: ["x", "u1"],
      } as UpdateChatDto);
      expect(inviteRepo.delete).toHaveBeenCalledWith("invite-id");
      expect(res).toEqual({ message: "Convite aceito com sucesso!" });
    });

    it("should throw if invite not found", async () => {
      inviteRepo.findById.mockResolvedValue(null);
      await expect(service.acceptInvite("bad")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("delete", () => {
    it("should remove invite and return message", async () => {
      inviteRepo.findById.mockResolvedValue(mockInvite);
      const res = await service.delete("invite-id");
      expect(inviteRepo.findById).toHaveBeenCalledWith("invite-id");
      expect(inviteRepo.delete).toHaveBeenCalledWith("invite-id");
      expect(res).toEqual({ message: "Convite removido com sucesso!" });
    });

    it("should throw if invite not found", async () => {
      inviteRepo.findById.mockResolvedValue(null);
      await expect(service.delete("bad")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
