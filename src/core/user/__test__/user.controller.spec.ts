import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { LoginUserDto } from "../dto/login-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";
import { AuthResponseMessage } from "../../../shared/interfaces/auth-response-message";
import { ResponseMessage } from "../../../shared/interfaces/response-message";

describe("UserController", () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockUser = {
    _id: "id",
    name: "Test",
    email: "test@example.com",
  } as unknown as User;

  const authResponse: AuthResponseMessage = {
    message: "Success",
    token: "token",
    user: mockUser,
  };

  const responseMsg: ResponseMessage = { message: "Done" };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            login: jest.fn(),
            findByEmail: jest.fn(),
            decodeToken: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService) as jest.Mocked<UserService>;
  });

  it("should be defined", () => expect(controller).toBeDefined());

  describe("create", () => {
    it("should call service.create and return AuthResponseMessage", async () => {
      const dto: CreateUserDto = {
        email: "a@b.com",
        password: "pass",
        name: "Alice",
      };
      service.create.mockResolvedValue(authResponse);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(authResponse);
    });
  });

  describe("login", () => {
    it("should call service.login and return AuthResponseMessage", async () => {
      const dto: LoginUserDto = { email: "a@b.com", password: "pass" };
      service.login.mockResolvedValue(authResponse);

      const result = await controller.login(dto);
      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toBe(authResponse);
    });
  });

  describe("findOne", () => {
    it("should call service.findByEmail and return User", async () => {
      service.findByEmail.mockResolvedValue(mockUser);

      const result = await controller.findOne("a@b.com");
      expect(service.findByEmail).toHaveBeenCalledWith("a@b.com");
      expect(result).toBe(mockUser);
    });
  });

  describe("decodeToken", () => {
    it("should call service.decodeToken and return User", async () => {
      service.decodeToken.mockResolvedValue(mockUser);

      const result = await controller.decodeToken("token");
      expect(service.decodeToken).toHaveBeenCalledWith("token");
      expect(result).toBe(mockUser);
    });
  });

  describe("update", () => {
    it("should call service.update and return ResponseMessage", async () => {
      const dto: UpdateUserDto = { email: "new@b.com" };
      service.update.mockResolvedValue(responseMsg);

      const result = await controller.update("id", dto);
      expect(service.update).toHaveBeenCalledWith("id", dto);
      expect(result).toBe(responseMsg);
    });
  });

  describe("delete", () => {
    it("should call service.delete and return ResponseMessage", async () => {
      service.delete.mockResolvedValue(responseMsg);

      const result = await controller.delete("id");
      expect(service.delete).toHaveBeenCalledWith("id");
      expect(result).toBe(responseMsg);
    });
  });
});
