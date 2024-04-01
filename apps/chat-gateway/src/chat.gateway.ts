import {
  BaseWsExceptionFilter,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '@app/redis';
import { SecurityService } from '@app/security';
import { JwtAuthGuard } from '@app/security/guards/security.guard';
import { UserSessionDto } from '@app/security/dtos/UserSessionDto';
import { RequirePermissions } from '@app/security/decorators/permission.decorator';
import { ChatEventsEnum } from './domain/chat-events.enum';
import { RequestDto } from '@app/types/request.dto';
import { UseFilters, UseGuards } from '@nestjs/common';
import { RoomForm } from '@app/types/room.form';
import { MessageForm } from '@app/types/message.form';
import { RoomDto } from '@app/types/room.dto';
import { UserPermissions } from '@prisma/client';
import { MessageDto } from '@app/types';
import { v4 } from 'uuid';

@WebSocketGateway({
  cors: true,
})
@UseFilters(BaseWsExceptionFilter)
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
  constructor(
    private readonly redisService: RedisService,
    private readonly securityService: SecurityService
  ) {}
  @WebSocketServer() server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {}

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.PublishToRooms)
  @SubscribeMessage(ChatEventsEnum.ConnectUser)
  async handleUserConnection(@ConnectedSocket() client: Socket) {
    const userDto = UserSessionDto.fromPayload(client.data.user);
    const user = await this.securityService.getUserById({ id: userDto.id });

    if (!user) throw new WsException('User does not exist');
    await client.join(user.id);

    const room = await this.redisService.isRoomInStore(user.id);
    if (!room) {
      const requestDto = RequestDto.toEntity(user);
      await this.redisService.addRoom(requestDto);
      this.server.to('rooms').emit('new-chat', requestDto);
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.SubscribeToRooms)
  @SubscribeMessage(ChatEventsEnum.ConnectManager)
  async handleManagerConnection(@ConnectedSocket() client: Socket) {
    const userDto = UserSessionDto.fromPayload(client.data.user);
    const manager = await this.securityService.getManagerById({
      id: userDto.id,
    });

    if (!manager) throw new WsException('Invalid form');

    await client.join('rooms');
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.JoinRoom)
  @SubscribeMessage(ChatEventsEnum.JoinRoom)
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RoomForm
  ) {
    const form = RoomForm.from(data);
    const errors = await RoomForm.validate(form);

    if (errors) throw new WsException('Invalid form');

    client.join(form.room_id);
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetMessages)
  @SubscribeMessage(ChatEventsEnum.GetMessages)
  async handleMessagesGet(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RoomForm
  ) {
    const form = RoomForm.from(data);
    const errors = await RoomForm.validate(form);

    if (errors) throw new WsException('Invalid form');

    const messages = await this.redisService.getAllMessages(data.room_id);
    if (!messages) throw new WsException('No existing messages');

    const messagesDto = MessageDto.toEntities(messages);

    this.server.to(client.id).emit('messages', messagesDto);
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetRooms)
  @SubscribeMessage(ChatEventsEnum.GetRooms)
  async handleRoomsGet(@ConnectedSocket() client: Socket) {
    const rooms = await this.redisService.getRooms();

    if (!rooms) throw new WsException('No existing rooms');

    const roomsDto = RoomDto.toEntities(rooms);
    this.server.to(client.id).emit('rooms', roomsDto);
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.SendMessages)
  @SubscribeMessage(ChatEventsEnum.Message)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageForm
  ) {
    const form = MessageForm.from(data);
    const errors = await MessageForm.validate(form);
    if (errors) throw new WsException('Invalid form');

    const user = client.data.user;
    const message = {
      ...form,
      id: v4(),
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: new Date(),
    };

    const messageDto = MessageDto.toEntity(message);
    await this.redisService.saveMessage(messageDto);

    this.server.to(messageDto.room_id).emit('message', messageDto);
  }

  async handleDisconnect(client: Socket) {}
}
