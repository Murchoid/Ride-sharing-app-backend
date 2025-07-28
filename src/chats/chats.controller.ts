// src/chats/chats.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chats.service';
import { AtGuard } from '../auths/guards/at.guards';
import { CreateMessageDto } from './dto/createMessage.dto';

@Controller('chat')
@UseGuards(AtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  getMessages(@Query('rideId') rideId: string) {
    return this.chatService.getMessagesByRide(rideId);
  }

  @Post('messages')
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.chatService.saveMessage(createMessageDto);
  }
}
