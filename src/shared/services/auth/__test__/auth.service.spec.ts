import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { hash, compare } from "bcrypt";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it("should be defined", () => expect(service).toBeDefined());

  describe("generateToken", () => {
    it("should call jwtService.signAsync and return token", async () => {
      jwtService.signAsync.mockResolvedValue("signed-token");
      const token = await service.generateToken("payload");
      expect(jwtService.signAsync).toHaveBeenCalledWith("payload");
      expect(token).toBe("signed-token");
    });
  });

  describe("decodeToken", () => {
    it("should verify token and return decoded", async () => {
      jwtService.verifyAsync.mockResolvedValue(
        "decoded-value" as unknown as object,
      );
      const result = await service.decodeToken("my-token");
      expect(jwtService.verifyAsync).toHaveBeenCalledWith("my-token");
      expect(result).toBe("decoded-value");
    });

    it("should throw BadRequestException on invalid token", async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error("invalid"));
      await expect(service.decodeToken("bad-token")).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe("hashPassword", () => {
    it("should get salt rounds and return hashed password", async () => {
      (configService.get as jest.Mock).mockReturnValue(12);
      (hash as jest.Mock).mockResolvedValue("hashed-pass");

      const hashResult = await service.hashPassword("plain-pass");

      expect(configService.get).toHaveBeenCalledWith("salts");
      expect(hash).toHaveBeenCalledWith("plain-pass", 12);
      expect(hashResult).toBe("hashed-pass");
    });
  });

  describe("comparePassword", () => {
    it("should resolve if passwords match", async () => {
      (compare as jest.Mock).mockResolvedValue(true);
      await expect(
        service.comparePassword("plain", "hashed"),
      ).resolves.toBeUndefined();
      expect(compare).toHaveBeenCalledWith("plain", "hashed");
    });

    it("should throw BadRequestException if passwords do not match", async () => {
      (compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.comparePassword("plain", "wrong-hash"),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
