import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ChatService } from "../chat.service";
import { IChatRepository } from "../repositories/chat.repository";
import { UserService } from "../../user/user.service";
import { InviteService } from "../../invite/invite.service";
import { CreateChatDto } from "../dto/create-chat.dto";
import { UpdateChatDto } from "../dto/update-chat.dto";
import { Chat } from "../entities/chat.entity";
import { User } from "../../user/entities/user.entity";

describe("ChatService", () => {
  let service: ChatService;
  let chatRepo: jest.Mocked<IChatRepository>;
  let userService: jest.Mocked<UserService>;
  let inviteService: jest.Mocked<InviteService>;

  const mockAdm: User = {
    id: "adm-id",
    name: "Admin",
    email: "adm@e.com",
  } as unknown as User;

  const mockUser: User = {
    id: "usr-id",
    name: "User",
    email: "usr@e.com",
  } as unknown as User;

  const mockChat: Chat = {
    id: "chat-id",
    name: "chat-name",
    users: ["adm-id", "usr-id"],
  } as unknown as Chat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: "ChatRepository",
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findManyByUser: jest.fn(),
            findManyByNameAndUser: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: InviteService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepo = module.get("ChatRepository");
    userService = module.get(UserService);
    inviteService = module.get(InviteService);
  });

  it("should be defined", () => expect(service).toBeDefined());

  describe("create", () => {
    it("should create a chat and send invites", async () => {
      const dto: CreateChatDto = {
        name: "Grupo",
        users: ["adm@e.com", "usr@e.com"],
      };
      userService.findByEmail
        .mockResolvedValueOnce(mockAdm)
        .mockResolvedValueOnce(mockUser);
      chatRepo.create.mockResolvedValue(mockChat);
      inviteService.create.mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(userService.findByEmail).toHaveBeenNthCalledWith(1, "adm@e.com");
      expect(userService.findByEmail).toHaveBeenNthCalledWith(2, "usr@e.com");
      expect(chatRepo.create).toHaveBeenCalledWith({
        name: "Grupo",
        users: ["adm-id"],
      });
      expect(inviteService.create).toHaveBeenCalledWith({
        name: "Grupo",
        chat: "chat-id",
        adm: mockAdm,
        users: [mockUser],
      });
      expect(result).toEqual({
        message: "Conversa iniciada com sucesso!",
      });
    });
  });

  describe("findById", () => {
    it("should return chat if found", async () => {
      chatRepo.findById.mockResolvedValue(mockChat);
      const chat = await service.findById("chat-id");
      expect(chat).toBe(mockChat);
    });

    it("should throw NotFoundException if not found", async () => {
      chatRepo.findById.mockResolvedValue(null);
      await expect(service.findById("nope")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("findManyByUser", () => {
    it("should return array of chats", async () => {
      const chats = [mockChat];
      chatRepo.findManyByUser.mockResolvedValue(chats);
      const result = await service.findManyByUser("usr@e.com");
      expect(chatRepo.findManyByUser).toHaveBeenCalledWith("usr@e.com");
      expect(result).toBe(chats);
    });
  });

  describe("findManyByNameAndUser", () => {
    it("should return array of chats by name and user", async () => {
      const chats = [mockChat];
      chatRepo.findManyByNameAndUser.mockResolvedValue(chats);
      const result = await service.findManyByNameAndUser("nome", "usr@e.com");
      expect(chatRepo.findManyByNameAndUser).toHaveBeenCalledWith(
        "nome",
        "usr@e.com",
      );
      expect(result).toBe(chats);
    });
  });

  describe("update", () => {
    it("should update chat and return message", async () => {
      jest.spyOn(service, "findById").mockResolvedValue(mockChat);
      const dto: UpdateChatDto = { name: "Novo", users: ["x@y.com"] };
      chatRepo.update.mockResolvedValue(undefined);

      const res = await service.update("chat-id", dto);
      expect(service.findById).toHaveBeenCalledWith("chat-id");
      expect(chatRepo.update).toHaveBeenCalledWith("chat-id", dto);
      expect(res).toEqual({
        message: "Conversa atualizada com sucesso!",
      });
    });

    it("should throw if chat not found", async () => {
      jest
        .spyOn(service, "findById")
        .mockRejectedValue(new NotFoundException());
      await expect(service.update("bad", {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("delete", () => {
    it("should delete chat and return message", async () => {
      jest.spyOn(service, "findById").mockResolvedValue(mockChat);
      chatRepo.delete.mockResolvedValue(undefined);

      const res = await service.delete("chat-id");
      expect(service.findById).toHaveBeenCalledWith("chat-id");
      expect(chatRepo.delete).toHaveBeenCalledWith("chat-id");
      expect(res).toEqual({
        message: "Conversa atualizada com sucesso!",
      });
    });

    it("should throw if chat not found", async () => {
      jest
        .spyOn(service, "findById")
        .mockRejectedValue(new NotFoundException());
      await expect(service.delete("bad")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
