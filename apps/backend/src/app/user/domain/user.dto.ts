import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TicketDto } from './ticket.dto';

export class UserDto {
  @ApiProperty({
    description: 'Correct id',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Correct first name',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Correct last name',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    description: 'Correct email',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  tickets: TicketDto[];


  static toEntity(entity?: UserDto) {
    const it = {
      id: entity.id,
      first_name: entity.first_name,
      last_name: entity.last_name,
      email: entity.email,
      tickets: entity.tickets,
    };
    return it;
  }
  static toEntities(arr?: UserDto[]) {
    const it = arr.map((user) => this.toEntity(user));
    return it;
  }
}
