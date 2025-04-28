import { User } from "src/core/user/entities/user.entity";

export class CreateInviteDto {
  public chat: string;
  public name?: string;
  public adm: User;
  public users: User[];
}
