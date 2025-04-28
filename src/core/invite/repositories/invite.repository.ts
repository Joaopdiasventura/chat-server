import { Invite } from "../entities/invite.entity";

export interface IInviteRepository {
  create(chat: string, user: string): Promise<Invite>;
  findById(id: string): Promise<Invite>;
  findManyByUser(user: string): Promise<Invite[]>;
  delete(id: string): Promise<Invite>;
}
