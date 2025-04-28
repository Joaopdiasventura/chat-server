import { Test, TestingModule } from "@nestjs/testing";
import { ChatController } from "../chat.controller";
import { ChatService } from "../chat.service";
import { CreateChatDto } from "../dto/create-chat.dto";
import { UpdateChatDto } from "../dto/update-chat.dto";
import { Chat } from "../entities/chat.entity";
import { ResponseMessage } from "../../../shared/interfaces/response-message";
import { UserService } from "../../user/user.service";

describe("ChatController", () => {
  let controller: ChatController;
  let service: jest.Mocked<ChatService>;

  const mockResponse: ResponseMessage = { message: "OK" };

  const mockChats: Chat[] = [
    { _id: "c1", name: "chat1", users: ["u1", "u2"] } as unknown as Chat,
    { _id: "c2", name: "chat2", users: ["u1", "u3"] } as unknown as Chat,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            create: jest.fn(),
            findManyByUser: jest.fn(),
            findManyByNameAndUser: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn().mockReturnValue({
              _id: "u1",
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get(ChatService) as jest.Mocked<ChatService>;
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call chatService.create and return ResponseMessage", async () => {
      const dto: CreateChatDto = { name: "Grupo", users: ["u1", "u2"] };
      service.create.mockResolvedValue(mockResponse);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockResponse);
    });
  });

  describe("findManyByUser", () => {
    it("should call chatService.findManyByUser and return Chat[]", async () => {
      service.findManyByUser.mockResolvedValue(mockChats);

      const result = await controller.findManyByUser("u1");
      expect(service.findManyByUser).toHaveBeenCalledWith("u1");
      expect(result).toBe(mockChats);
    });
  });

  describe("findManyByNameAndUser", () => {
    it("should call chatService.findManyByNameAndUser and return Chat[]", async () => {
      service.findManyByNameAndUser.mockResolvedValue(mockChats);

      const result = await controller.findManyByNameAndUser("chat", "u1");
      expect(service.findManyByNameAndUser).toHaveBeenCalledWith("chat", "u1");
      expect(result).toBe(mockChats);
    });
  });

  describe("update", () => {
    it("should call chatService.update and return ResponseMessage", async () => {
      const dto: UpdateChatDto = { name: "NovoNome", users: ["u1"] };
      service.update.mockResolvedValue(mockResponse);

      const result = await controller.update("c1", dto);
      expect(service.update).toHaveBeenCalledWith("c1", dto);
      expect(result).toBe(mockResponse);
    });
  });

  describe("delete", () => {
    it("should call chatService.delete and return ResponseMessage", async () => {
      service.delete.mockResolvedValue(mockResponse);

      const result = await controller.delete("c1");
      expect(service.delete).toHaveBeenCalledWith("c1");
      expect(result).toBe(mockResponse);
    });
  });
});
