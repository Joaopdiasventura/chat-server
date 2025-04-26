import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginUserDto {
  @IsEmail({}, { message: "Digite um email válido" })
  public email: string;

  @IsString({ message: "Digite uma senha válida" })
  @MinLength(6, { message: "A senha deve ter pelo menos 6 caracteres" })
  public password: string;
}
