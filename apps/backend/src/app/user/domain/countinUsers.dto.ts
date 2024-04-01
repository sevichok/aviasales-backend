import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TicketDto } from './ticket.dto';
import { UserDto } from './user.dto';

export class CountingUserDto {
  @ApiProperty({
    description: 'total user count ',
  })
  totalUserCount: number;

  @ApiProperty({
    description: 'Correct first name',
  })
  users: UserDto[];




  static toEntity(entity?: CountingUserDto) {
    const it = {
      totalUserCount: entity.totalUserCount,
      users: entity.users,
    };
    return it;
  }
  static toEntities(arr?: CountingUserDto[]) {
    const it = arr.map((user) => this.toEntity(user));
    return it;
  }
}
