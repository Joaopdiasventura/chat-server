import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { User } from "./entities/user.entity";
import { ResponseMessage } from "src/shared/interfaces/response-message";
import { AuthResponseMessage } from "../../shared/interfaces/auth-response-message";
import { AuthGuard } from "../../shared/services/auth/guards/auth.guard";

@Controller("user")
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Post()
  public create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AuthResponseMessage> {
    return this.userService.create(createUserDto);
  }

  @Post("login")
  public login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<AuthResponseMessage> {
    return this.userService.login(loginUserDto);
  }

  @Get(":email")
  @UseGuards(AuthGuard)
  public findOne(@Param("email") email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  @Get("decodeToken/:token")
  public decodeToken(@Param("token") token: string): Promise<User> {
    return this.userService.decodeToken(token);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  public update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseMessage> {
    return this.userService.update(id, updateUserDto);
  }

  @Patch("validateEmail/:token")
  public validateEmail(
    @Param("token") token: string,
  ): Promise<ResponseMessage> {
    return this.userService.validateEmail(token);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  public delete(@Param("id") id: string): Promise<ResponseMessage> {
    return this.userService.delete(id);
  }
}
