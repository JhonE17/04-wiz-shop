import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtServie: JwtService
  ) {}
  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtServie.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({payload})
    // console.log('Client connect: ', client)

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }
  handleDisconnect(client: Socket) {
    // console.log('Client disconnect: ', client.id)
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  @SubscribeMessage('message-form-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    //message-form-server
    //! Emite únicamente al cliente
    /* client.emit('message-form-server', {
      fullName: 'Soy yo!',
      message: payload.message || 'no-message!!',
    }); */
    //! Emitir a todos MENOS, al cliente Inicial
    /* client.broadcast.emit('message-form-server', {
      fullName: 'Soy yo!',
      message: payload.message || 'no-message!!',
    }); */
    this.wss.emit('message-form-server', {
      fullName: this.messagesWsService.getUserFullNameBySocketId(client.id),
      message: payload.message || 'no-message!!',
    });
  }

  
}
