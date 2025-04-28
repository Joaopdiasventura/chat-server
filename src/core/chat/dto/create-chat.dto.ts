import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateChatDto {
  @Transform(({ value, obj }) =>
    obj.users && obj.users.length > 2 ? value : undefined,
  )
  @ValidateIf((o) => o.users && o.users.length > 2)
  @IsString({ message: "Digite um nome válido" })
  @IsNotEmpty({ message: "Digite um nome válido" })
  public name?: string;

  @IsArray({ message: "Users deve ser um array de IDs" })
  @ArrayUnique({ message: "Não pode haver participantes repetidos" })
  @IsEmail(
    {},
    {
      each: true,
      message: "Cada participante deve ser um ObjectId (string) válido",
    },
  )
  public users: string[];
}
