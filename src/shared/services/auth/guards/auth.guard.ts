import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "../../../../core/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly userService: UserService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization;
    if (!token) throw new UnauthorizedException("Token não enviado");

    await this.userService.decodeToken(token);

    return true;
  }
}
