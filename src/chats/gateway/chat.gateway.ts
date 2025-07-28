import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { CreateMessageDto } from '../dto/createMessage.dto';
import { ChatService } from '../chats.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private onlineUsers: Map<string, Set<string>> = new Map();
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`New client connected: ${client.id}`);

    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      });

      client.data.user = payload;
      const userId = payload.sub;

      client.join(userId);

      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)?.add(client.id);

      this.logger.log(`Client ${client.id} authenticated as user ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error from client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId && this.onlineUsers.has(userId)) {
      const userSockets = this.onlineUsers.get(userId);
      userSockets?.delete(client.id);
      if (userSockets?.size === 0) {
        this.onlineUsers.delete(userId);
      }
      this.logger.log(`Client disconnected: ${client.id} (user ${userId})`);
    } else {
      this.logger.log(`Client disconnected: ${client.id} (no user data)`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messageToSave = {
        ...data,
        createdAt: new Date(),
      };

      const savedMessage = await this.chatService.saveMessage(messageToSave);

      // Emit to both sender and receiver
      this.server.to(data.receiverId).emit('receive_message', savedMessage);
      this.server.to(data.senderId).emit('receive_message', savedMessage);

      this.logger.log(
        `Message ${savedMessage.id} from ${data.senderId} to ${data.receiverId} delivered`
      );

      return { success: true, message: savedMessage };
    } catch (error) {
      this.logger.error('Message handling error:', error);
      client.emit('message_error', {
        error: 'Failed to save message',
        originalMessage: data,
      });
      return { success: false, error: error.message };
    }
  }

  // Add this method to your ChatGateway

sendBookingStatusUpdate(booking: {
  id: string;
  userId: string;
  status: string;
  role: string,
  pickup?: string;
  dropoff?: string;
  price?: number;
  driverName?: string;
  vehicleInfo?: string;
  passengerName?: string;
}) {
  this.server.to(booking.userId).emit('booking_status_updated', {
    id: booking.id,
    status: booking.status,
    role: booking.role,
    pickup: booking.pickup,
    dropoff: booking.dropoff,
    price: booking.price,
    driverName: booking.driverName,
    vehicleInfo: booking.vehicleInfo,
    passengerName: booking.passengerName
  });
}

}