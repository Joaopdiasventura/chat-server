import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "Digite um email válido" })
  public email: string;

  @IsString({ message: "Digite um nome válido" })
  @IsNotEmpty({ message: "Digite um nome válido" })
  public name: string;

  @IsString({ message: "Digite uma senha válida" })
  @MinLength(6, { message: "A senha deve ter pelo menos 6 caracteres" })
  public password: string;

  @IsOptional()
  @IsString({ message: "Digite uma cor válida" })
  @IsNotEmpty({ message: "Digite uma cor válida" })
  public color?: string;
}
