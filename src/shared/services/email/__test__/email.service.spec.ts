import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "../email.service";
import { ConfigService } from "@nestjs/config";
import { InternalServerErrorException } from "@nestjs/common";
import { createTransport } from "nodemailer";
import { SendEmailDto } from "../dto/send-email.dto";

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

describe("EmailService", () => {
  let service: EmailService;
  let configService: jest.Mocked<ConfigService>;
  const sendMailMock = jest.fn();

  beforeEach(async () => {
    (createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case "email.password":
                  return "pass123";
                case "email.account":
                  return "user@example.com";
                case "client.url":
                  return "http://localhost:3000";
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService);
  });

  it("should be defined", () => expect(service).toBeDefined());

  it("should send email using transporter.sendMail", async () => {
    const dto: SendEmailDto = {
      to: 'to@ex.com',
      subject: "Subject",
      html: "<p>Hello</p>",
    };

    await service.sendEmail(dto);

    expect(createTransport).toHaveBeenCalledWith({
      service: "Gmail",
      auth: {
        user: "user@example.com",
        pass: "pass123",
      },
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: '"João Paulo Dias" <user@example.com>',
      ...dto,
    });
  });

  it("should throw InternalServerErrorException on send failure", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("SMTP error"));
    const dto: SendEmailDto = {
      to: "x@y.com",
      subject: "Subj",
      html: "HTML",
    };

    await expect(service.sendEmail(dto)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
