import { Injectable } from '@nestjs/common';
import { ConnectedClients } from './interfaces/connected-client';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MessagesWsService {
  private connectedClient: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');
    this.checkConnetionUser(user)

    this.connectedClient[client.id] = {
      socket: client,
      user,
    };
  }

  removeClient(clientId: string) {
    delete this.connectedClient[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClient);
  }

  getUserFullNameBySocketId(socketId: string) {
  return this.connectedClient[socketId].user.fullName
  }

  private checkConnetionUser(user: User){

    for(const clientId of Object.keys(this.connectedClient)){
        const connectedClient = this.connectedClient[clientId]
        if(connectedClient.user.id === user.id){
            connectedClient.socket.disconnect()
            break;
        }
    }

  }
}
