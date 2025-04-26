import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { hash, compare } from "bcrypt";

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async generateToken(payload: string): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  public async decodeToken(token: string): Promise<string> {
    try {
      const result = await this.jwtService.verifyAsync(token);
      return String(result);
    } catch {
      throw new BadRequestException("Faça login novamente");
    }
  }

  public async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>("salts");
    return hash(password, saltRounds);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    const isValid = await compare(password, hashedPassword);
    if (!isValid) throw new BadRequestException("Senha incorreta");
  }
}
