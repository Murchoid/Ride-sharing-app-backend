// src/chats/gateway/chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { ChatService } from '../chats.service';
import { ConfigService } from '@nestjs/config';
import { CreateMessageDto } from '../dto/createMessage.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('ChatGateway');
  private onlineUsers = new Map<string, string>();
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private configService: ConfigService
  ) {}

  afterInit(server: Server) {
    server.on('error', (error) => {
      console.error('Socket Server Error:', error);
    });
    this.logger.log('WebSocket initialized');
  }

  async handleConnection(client: Socket) {
    console.log('Auth header:', client.handshake.headers.authorization);
    console.log('Auth token:', client.handshake.auth.token);
    
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify the token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'), 
      });

      // Store user data in socket
      client.data.user = payload;

      this.onlineUsers.set(payload.sub, client.id);
      this.logger.log(`Client connected: ${client.id} (user ${payload.sub})`);

      return true;
    } catch (error) {
      console.error('Detailed WS Auth Error:', {
        message: error.message,
        stack: error.stack,
        token: client.handshake.auth.token
      });
      client.disconnect();
      return false;
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
    data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Save the message
      const savedMessage = await this.chatService.saveMessage(data);

      // Get receiver's socket ID
      const receiverSocketId = this.onlineUsers.get(data.receiverId);
      
      // Emit to receiver if online
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('receive_message', savedMessage);
      }

      // Emit back to sender to confirm message was saved
      client.emit('message_sent', savedMessage);

      return savedMessage;
    } catch (error) {
      this.logger.error('Error handling message:', error);
      client.emit('message_error', { error: 'Failed to save message' });
    }
  }

  @SubscribeMessage('send_notification')
  async handleNotification(
    @MessageBody() data: { receiverId: string; title: string; body: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Save notification
      await this.chatService.saveNotification(data);

      // Get receiver's socket ID
      const receiverSocketId = this.onlineUsers.get(data.receiverId);
      
      // Emit to receiver if online
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('receive_notification', data);
      }
    } catch (error) {
      this.logger.error('Error handling notification:', error);
      client.emit('notification_error', { error: 'Failed to save notification' });
    }
  }
}
