import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TicketStatus } from '@prisma/client';
import { FlightDto } from './flight.dto';

export class TicketDto {
  @ApiProperty({
    description: 'ticket id',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'ticket holder_first_name',
  })
  @IsString()
  @IsNotEmpty()
  holder_first_name: string;

  @ApiProperty({
    description: 'ticket holder_last_name',
  })
  @IsString()
  @IsNotEmpty()
  holder_last_name: string;

  @ApiProperty({
    description: 'ticket flight_id',
  })
  @IsUUID()
  @IsNotEmpty()
  flight_id: string;

  @ApiProperty({
    description: 'ticket user_id',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'ticket status',
  })
  @IsString()
  @IsNotEmpty()
  status: TicketStatus;

  flight: FlightDto;
  static toEntity(entity?: TicketDto) {
    const it = {
      id: entity.id,
      holder_first_name: entity.holder_first_name,
      holder_last_name: entity.holder_last_name,
      status: entity.status,
      flight_id: entity.flight_id,
      user_id: entity.user_id,
      flight: entity.flight
    };
    return it;
  }
  static toEntities(arr?: TicketDto[]) {
    const it = arr.map((order) => this.toEntity(order));
    return it;
  }
}
