import { FlightStatus } from '@prisma/client';
import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PlaneDto } from './plane.dto';
import { CityDto } from './city.dto';

export class FlightDto {
  @ApiProperty({
    description: 'id',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'from city id',
  })
  @IsUUID()
  @IsNotEmpty()
  from_city_id: string;

  @ApiProperty({
    description: 'to city id',
  })
  @IsUUID()
  @IsNotEmpty()
  to_city_id: string;

  @ApiProperty({
    description: 'start flight date',
  })
  @IsNotEmpty()
  start_flight_date: Date;

  @ApiProperty({
    description: 'end flight date',
  })
  @IsNotEmpty()
  end_flight_date: Date;

  @ApiProperty({
    description: 'status',
  })
  @IsString()
  @IsNotEmpty()
  status: FlightStatus;

  @ApiProperty({
    description: 'price',
  })
  @IsInt()
  price: number;

  @ApiProperty({
    description: 'available seats',
  })
  @IsInt()
  available_seats: number;

  @ApiProperty({
    description: 'plane id',
  })
  @IsUUID()
  @IsNotEmpty()
  plane_id: string;

  @ApiProperty({
    description: 'from_city',
  })
  @IsNotEmpty()
  from_city: CityDto;

  @ApiProperty({
    description: 'to_city',
  })
  @IsNotEmpty()
  to_city: CityDto;

  @ApiProperty({
    description: 'plane',
  })
  @IsNotEmpty()
  plane: PlaneDto;

  static toEntity(entity?: FlightDto) {
    const it = {
      start_flight_date: entity.start_flight_date.valueOf(),
      end_flight_date: entity.end_flight_date.valueOf(),
      status: entity.status,
      price: entity.price,
      available_seats: entity.available_seats,
      plane: entity.plane.title,
      from_city: entity.from_city.title,
      to_city: entity.to_city.title,
    };
    return it;
  }
  static toEntities(arr?: FlightDto[]) {
    const it = arr.map((order) => this.toEntity(order));
    return it;
  }
}
