import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transporter, createTransport } from "nodemailer";
import { SendEmailDto } from "./dto/send-email.dto";

@Injectable()
export class EmailService {
  private transporter: Transporter;

  public constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      service: "Gmail",
      auth: {
        user: this.configService.get<string>("email.account"),
        pass: this.configService.get<string>("email.password"),
      },
    });
  }

  public async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"João Paulo Dias" <${this.configService.get<string>("email.account")}>`,
        ...sendEmailDto,
      });
    } catch (error) {
      console.error("Erro ao enviar o email:", error);
      throw new InternalServerErrorException(
        "Erro ao enviar o email, tente novamente mais tarde ou contate o suporte",
      );
    }
  }

  public createValidationButtonMessage(token: string): string {
    return `
      <div style="text-align: center;">
        <div style="margin-top: 20px;">
          <a href="${this.configService.get<string>("client.url")}/access/validate?token=${token}">
            <button 
              style="background-color: #101010; color: #fff; border: none; padding: 20px; font-size: 16px; border-radius: 10px;">
              VALIDAR CONTA
            </button>
          </a>
        </div>
      </div>
    `;
  }
}
