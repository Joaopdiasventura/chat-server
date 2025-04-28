import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateMessageDto {
  @IsMongoId({})
  public user: string;

  @IsMongoId({})
  public chat: string;

  @IsString({})
  @IsNotEmpty({ message: "Impossível enviar uma mensagem vazia" })
  public content: string;
}
