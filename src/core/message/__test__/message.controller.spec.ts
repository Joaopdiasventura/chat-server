import { Test, TestingModule } from "@nestjs/testing";
import { MessageController } from "../message.controller";
import { MessageService } from "../message.service";
import { CreateMessageDto } from "../dto/create-message.dto";
import { Message } from "../entities/message.entity";

describe("MessageController", () => {
  let controller: MessageController;
  let service: jest.Mocked<MessageService>;

  const mockMessage: Message = {
    _id: "m1",
    user: "u1",
    chat: "c1",
    content: "Hello",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Message;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: {
            create: jest.fn(),
            findManyByChat: jest.fn(),
            findLastest: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get(MessageService) as jest.Mocked<MessageService>;
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call service.create and return the created message", async () => {
      const dto: CreateMessageDto = {
        user: "u1",
        chat: "c1",
        content: "Hello",
      };
      service.create.mockResolvedValue(mockMessage);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockMessage);
    });
  });

  describe("findManyByChat", () => {
    it("should call service.findManyByChat and return an array of messages", async () => {
      const messages = [mockMessage];
      service.findManyByChat.mockResolvedValue(messages);

      const result = await controller.findManyByChat("c1");
      expect(service.findManyByChat).toHaveBeenCalledWith("c1");
      expect(result).toBe(messages);
    });
  });

  describe("findLastest", () => {
    it("should call service.findLastest and return an array of messages", async () => {
      const messages = [mockMessage];
      service.findLastest.mockResolvedValue(messages);

      const result = await controller.findLastest("u1");
      expect(service.findLastest).toHaveBeenCalledWith("u1");
      expect(result).toBe(messages);
    });
  });
});
