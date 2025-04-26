import { Attachment } from "nodemailer/lib/mailer";

export class SendEmailDto {
  public to: string;
  public subject: string;
  public html: string;
  public attachments?: Attachment[];
}
