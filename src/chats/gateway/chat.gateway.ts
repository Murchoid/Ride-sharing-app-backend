// src/gateway/chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../services/chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('ChatGateway');
  private onlineUsers = new Map<string, string>();
  private server: Server;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService
  ) {}

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      this.onlineUsers.set(payload.sub, client.id);
      this.logger.log(`Client connected: ${client.id} (user ${payload.sub})`);
    } catch {
      this.logger.warn('Unauthorized socket connection');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, socketId] of this.onlineUsers) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: { rideId: string; senderId: string; receiverId: string; message: string },
  ) {
    const receiverSocketId = this.onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receive_message', data);
    }
    await this.chatService.saveMessage(data);
  }

  @SubscribeMessage('send_notification')
  async handleNotification(
    @MessageBody() data: { receiverId: string; title: string; body: string },
  ) {
    const receiverSocketId = this.onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receive_notification', data);
    }
    await this.chatService.saveNotification(data);
  }
}
