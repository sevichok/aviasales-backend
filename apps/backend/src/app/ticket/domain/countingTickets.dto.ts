import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TicketDto } from './ticket.dto';

export class CountingTicketsDto {
  @ApiProperty({
    description: 'total user count ',
  })
  totalTicketCount: number;

  @ApiProperty({
    description: 'Correct first name',
  })
  tickets: TicketDto[];




  static toEntity(entity?: CountingTicketsDto) {
    const it = {
        totalTicketCount: entity.totalTicketCount,
      tickets: entity.tickets,
    };
    return it;
  }
  static toEntities(arr?: CountingTicketsDto[]) {
    const it = arr.map((user) => this.toEntity(user));
    return it;
  }
}
