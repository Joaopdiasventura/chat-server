import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { MessageService } from "./message.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { Message } from "./entities/message.entity";

@Controller("message")
export class MessageController {
  public constructor(private readonly messageService: MessageService) {}

  @Post()
  public create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageService.create(createMessageDto);
  }

  @Get("findManyByChat/:chat")
  public findManyByChat(
    @Param("chat") chat: string,
  ): Promise<Message[]> {
    return this.messageService.findManyByChat(chat);
  }

  @Get("findLastest/:user")
  public findLastest(
    @Param("user") user: string,
  ): Promise<Message[]> {
    return this.messageService.findLastest(user);
  }
}
