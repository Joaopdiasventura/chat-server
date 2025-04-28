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
import { ChatService } from "./chat.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { UpdateChatDto } from "./dto/update-chat.dto";
import { ResponseMessage } from "../../shared/interfaces/response-message";
import { Chat } from "./entities/chat.entity";
import { AuthGuard } from "../../shared/services/auth/guards/auth.guard";

@Controller("chat")
export class ChatController {
  public constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(AuthGuard)
  public create(
    @Body() createChatDto: CreateChatDto,
  ): Promise<ResponseMessage> {
    return this.chatService.create(createChatDto);
  }

  @Get(":user")
  @UseGuards(AuthGuard)
  public findManyByUser(@Param("user") user: string): Promise<Chat[]> {
    return this.chatService.findManyByUser(user);
  }

  @Get(":name/:user")
  @UseGuards(AuthGuard)
  public findManyByNameAndUser(
    @Param("name") name: string,
    @Param("user") user: string,
  ): Promise<Chat[]> {
    return this.chatService.findManyByNameAndUser(name, user);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  public update(
    @Param("id") id: string,
    @Body() updateChatDto: UpdateChatDto,
  ): Promise<ResponseMessage> {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  public delete(@Param("id") id: string): Promise<ResponseMessage> {
    return this.chatService.delete(id);
  }
}
