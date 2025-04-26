import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { User } from "./entities/user.entity";
import { IUserRepository } from "./repositories/user.repository";
import { ResponseMessage } from "../../shared/interfaces/response-message";
import { AuthResponseMessage } from "../../shared/interfaces/auth-response-message";
import { AuthService } from "../../shared/services/auth/auth.service";
import { EmailService } from "../../shared/services/email/email.service";
import { UserGateway } from "./user.gateway";

@Injectable()
export class UserService {
  public constructor(
    @Inject("UserRepository") private readonly userRepository: IUserRepository,
    private readonly userGateway: UserGateway,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  public async create(
    createUserDto: CreateUserDto,
  ): Promise<AuthResponseMessage> {
    await this.ensureEmailIsNotUsed(createUserDto.email);

    createUserDto.password = await this.authService.hashPassword(
      createUserDto.password,
    );

    const user = await this.userRepository.create(createUserDto);

    const token = await this.authService.generateToken(user.id);

    const userData = user.toObject();
    delete userData.password;

    await this.emailService.sendEmail({
      to: user.email,
      subject: "VALIDAÇÃO DE CONTA",
      html: this.emailService.createValidationButtonMessage(token),
    });

    return {
      message: "Usuário criado com sucesso",
      token,
      user: userData,
    };
  }

  public async login(loginUserDto: LoginUserDto): Promise<AuthResponseMessage> {
    const user = await this.findByEmail(loginUserDto.email, true);

    await this.authService.comparePassword(
      loginUserDto.password,
      user.password,
    );

    const token = await this.authService.generateToken(user.id);

    const userData = user.toObject();
    delete userData.password;

    return {
      message: "Login realizado com sucesso",
      token,
      user: userData,
    };
  }

  public async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }

  public async findByEmail(
    email: string,
    withPassword?: boolean,
  ): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    if (!withPassword) delete user.password;
    return user;
  }

  public async decodeToken(token: string): Promise<User> {
    const id = await this.authService.decodeToken(token);
    return await this.findById(id);
  }

  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseMessage> {
    const { email } = await this.findById(id);

    if (updateUserDto.email && email != updateUserDto.email)
      await this.ensureEmailIsNotUsed(updateUserDto.email);

    if (updateUserDto.password)
      updateUserDto.password = await this.authService.hashPassword(
        updateUserDto.password,
      );

    await this.userRepository.update(id, updateUserDto);
    return { message: "Usuário atualizado com sucesso" };
  }

  public async validateEmail(token: string): Promise<ResponseMessage> {
    const id = await this.authService.decodeToken(token);
    const { email } = await this.findById(id);
    await this.update(id, { isVerified: true });
    this.userGateway.validateEmail(email);
    return { message: "Email validado com sucesso" };
  }

  public async delete(id: string): Promise<ResponseMessage> {
    await this.findById(id);
    await this.userRepository.delete(id);
    return { message: "Usuário deletado com sucesso" };
  }

  private async ensureEmailIsNotUsed(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (user) throw new BadRequestException("Email já cadastrado");
  }
}
