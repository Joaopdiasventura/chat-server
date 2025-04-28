import { Controller, Get, Post, Param, Delete, UseGuards } from "@nestjs/common";
import { InviteService } from "./invite.service";
import { Invite } from "./entities/invite.entity";
import { ResponseMessage } from "../../shared/interfaces/response-message";
import { AuthGuard } from "../../shared/services/auth/guards/auth.guard";

@Controller("invite")
export class InviteController {
  public constructor(private readonly inviteService: InviteService) {}

  @Post(":id")
  @UseGuards(AuthGuard)
  public acceptInvite(@Param("id") id: string): Promise<ResponseMessage> {
    return this.inviteService.acceptInvite(id);
  }

  @Get(":user")
  @UseGuards(AuthGuard)
  public findManyByUser(@Param("user") user: string): Promise<Invite[]> {
    return this.inviteService.findManyByUser(user);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  public delete(@Param("id") id: string): Promise<ResponseMessage> {
    return this.inviteService.delete(id);
  }
}
