import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { UserService } from "../user.service";
import { IUserRepository } from "../repositories/user.repository";
import { UserGateway } from "../user.gateway";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { LoginUserDto } from "../dto/login-user.dto";
import { User } from "../entities/user.entity";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { EmailService } from "../../../shared/services/email/email.service";

const mockUser = {
  _id: "user-id",
  name: "test",
  email: "test@example.com",
  password: "hashed-password",
  toObject: function () {
    return { ...this };
  },
} as unknown as User;

describe("UserService", () => {
  let service: UserService;
  let userRepo: jest.Mocked<IUserRepository>;
  let authService: jest.Mocked<AuthService>;
  let emailService: jest.Mocked<EmailService>;
  let userGateway: jest.Mocked<UserGateway>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: "UserRepository",
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn(),
            generateToken: jest.fn(),
            comparePassword: jest.fn(),
            decodeToken: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
            createValidationButtonMessage: jest.fn(),
          },
        },
        {
          provide: UserGateway,
          useValue: {
            validateEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get("UserRepository");
    authService = module.get(AuthService);
    emailService = module.get(EmailService);
    userGateway = module.get(UserGateway);
  });

  it("should be defined", () => expect(service).toBeDefined());

  describe("create", () => {
    it("should create a user and send validation email", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        password: "pass",
        name: "test",
      };
      authService.hashPassword.mockResolvedValue("hashed-password");
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue(mockUser);
      authService.generateToken.mockResolvedValue("token");
      emailService.createValidationButtonMessage.mockReturnValue("<button/>");

      const result = await service.create(dto);

      expect(userRepo.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(authService.hashPassword).toHaveBeenCalledWith("pass");
      expect(userRepo.create).toHaveBeenCalledWith({
        ...dto,
        password: "hashed-password",
      });
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: dto.email,
          subject: "VALIDAÇÃO DE CONTA",
          html: "<button/>",
        }),
      );
      expect(result).toEqual({
        message: "Usuário criado com sucesso",
        token: "token",
        user: expect.objectContaining({
          _id: "user-id",
          email: "test@example.com",
        }),
      });
    });

    it("should throw BadRequestException if email already used", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        password: "pass",
        name: "test",
      };
      userRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe("login", () => {
    it("should login and return token and user", async () => {
      const dto: LoginUserDto = { email: "test@example.com", password: "pass" };
      userRepo.findByEmail.mockResolvedValue(mockUser);
      authService.comparePassword.mockResolvedValue();
      authService.generateToken.mockResolvedValue("token");

      const result = await service.login(dto);

      expect(userRepo.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(authService.comparePassword).toHaveBeenCalledWith(
        dto.password,
        "hashed-password",
      );
      expect(result).toEqual({
        message: "Login realizado com sucesso",
        token: "token",
        user: expect.objectContaining({
          _id: "user-id",
          email: "test@example.com",
        }),
      });
    });

    it("should throw NotFoundException if user not found", async () => {
      const dto: LoginUserDto = {
        email: "noone@example.com",
        password: "pass",
      };
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("findById", () => {
    it("should return user if found", async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      const user = await service.findById("id");
      expect(user).toBe(mockUser);
    });

    it("should throw NotFoundException if not found", async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.findById("id")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("findByEmail", () => {
    it("should return user without password by default", async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);
      const user = await service.findByEmail("email");
      expect(user.password).toBeUndefined();
    });

    it("should return user with password if requested", async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);
      const user = await service.findByEmail("email", true);
      expect(user).toBe(mockUser);
    });

    it("should throw NotFoundException if not found", async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      await expect(service.findByEmail("email")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update user and return message", async () => {
      const dto: UpdateUserDto = { email: "new@example.com" };
      jest.spyOn(service, "findById").mockResolvedValue(mockUser);
      userRepo.findByEmail.mockResolvedValue(null);
      authService.hashPassword.mockResolvedValue("newhash");

      const res = await service.update("id", dto);
      expect(userRepo.update).toHaveBeenCalledWith("id", dto);
      expect(res).toEqual({ message: "Usuário atualizado com sucesso" });
    });

    it("should throw BadRequestException if email used", async () => {
      const dto: UpdateUserDto = { email: "taken@example.com" };
      jest.spyOn(service, "findById").mockResolvedValue(mockUser);
      userRepo.findByEmail.mockResolvedValue(mockUser);
      await expect(service.update("id", dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe("validateEmail", () => {
    it("should validate email and notify via gateway", async () => {
      authService.decodeToken.mockResolvedValue("user-id");
      jest.spyOn(service, "findById").mockResolvedValue(mockUser);
      jest.spyOn(service, "update").mockResolvedValue({ message: "" });

      const res = await service.validateEmail("token");
      expect(userGateway.validateEmail).toHaveBeenCalledWith(mockUser.email);
      expect(res).toEqual({ message: "Email validado com sucesso" });
    });
  });

  describe("delete", () => {
    it("should delete user and return message", async () => {
      jest.spyOn(service, "findById").mockResolvedValue(mockUser);
      const res = await service.delete("id");
      expect(userRepo.delete).toHaveBeenCalledWith("id");
      expect(res).toEqual({ message: "Usuário deletado com sucesso" });
    });
  });
});
