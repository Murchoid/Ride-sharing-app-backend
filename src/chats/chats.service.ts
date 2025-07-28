// src/chats/chats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { CreateMessageDto } from './dto/createMessage.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async saveMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return await this.messageRepository.save(message as any);
  }

  async getMessagesByRide(rideId: string): Promise<Message[]> {
    return this.messageRepository.find({ 
      where: { rideId },
      order: { createdAt: 'ASC' }
    });
  }

  async saveNotification(data: any): Promise<void> {
    await this.notificationRepository.save(data);
  }
}
