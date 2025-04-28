import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { MessageService } from "../message.service";
import { IMessageRepository } from "../repositories/message.repository";
import { MessageGateway } from "../message.gateway";
import { UserService } from "../../user/user.service";
import { ChatService } from "../../chat/chat.service";
import { CreateMessageDto } from "../dto/create-message.dto";
import { Message } from "../entities/message.entity";
import { Chat } from "../../chat/entities/chat.entity";
import { User } from "../../user/entities/user.entity";

describe("MessageService", () => {
  let service: MessageService;
  let repo: jest.Mocked<IMessageRepository>;
  let gateway: jest.Mocked<MessageGateway>;
  let userService: jest.Mocked<UserService>;
  let chatService: jest.Mocked<ChatService>;

  const mockDto: CreateMessageDto = {
    user: "u1",
    chat: "c1",
    content: "Hello",
  };

  const mockMessage: Message = {
    _id: "m1",
    user: "u1",
    chat: "c1",
    content: "Hello",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Message;

  const mockChat: Chat = {
    _id: "c1",
    users: ["u1", "u2"],
  } as unknown as Chat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: "MessageRepository",
          useValue: {
            create: jest.fn(),
            findManyByChat: jest.fn(),
            findLastest: jest.fn(),
          },
        },
        {
          provide: MessageGateway,
          useValue: { sendMessage: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { findById: jest.fn() },
        },
        {
          provide: ChatService,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    repo = module.get("MessageRepository");
    gateway = module.get(MessageGateway);
    userService = module.get(UserService);
    chatService = module.get(ChatService);
  });

  it("should be defined", () => expect(service).toBeDefined());

  describe("create", () => {
    it("should create a message when user is in chat", async () => {
      userService.findById.mockResolvedValue({ id: "u1" } as unknown as User);
      chatService.findById.mockResolvedValue(mockChat);
      repo.create.mockResolvedValue(mockMessage);

      const result = await service.create(mockDto);

      expect(userService.findById).toHaveBeenCalledWith("u1");
      expect(chatService.findById).toHaveBeenCalledWith("c1");
      expect(repo.create).toHaveBeenCalledWith(mockDto);
      expect(gateway.sendMessage).toHaveBeenCalledWith(mockChat, mockMessage);
      expect(result).toBe(mockMessage);
    });

    it("should throw BadRequestException if user not in chat", async () => {
      userService.findById.mockResolvedValue({ id: "u3" } as unknown as User);
      chatService.findById.mockResolvedValue(mockChat);

      expect(repo.create).not.toHaveBeenCalled();
      expect(gateway.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe("findManyByChat", () => {
    it("should return messages from repository", async () => {
      const arr = [mockMessage];
      repo.findManyByChat.mockResolvedValue(arr);

      const result = await service.findManyByChat("c1");

      expect(repo.findManyByChat).toHaveBeenCalledWith("c1");
      expect(result).toBe(arr);
    });
  });

  describe("findLastest", () => {
    it("should return latest messages from repository", async () => {
      const arr = [mockMessage];
      repo.findLastest.mockResolvedValue(arr);

      const result = await service.findLastest("u1");

      expect(repo.findLastest).toHaveBeenCalledWith("u1");
      expect(result).toBe(arr);
    });
  });
});
