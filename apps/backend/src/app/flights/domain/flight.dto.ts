import { FlightStatus } from '@prisma/client';
import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PlaneDto } from '../../ticket/domain/plane.dto';
import { CityDto } from '../../city/domain/city.dto';

export class FlightDto {
  @ApiProperty({
    description: 'Correct id',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Correct from_city_id',
  })
  @IsUUID()
  @IsNotEmpty()
  from_city_id: string;

  @ApiProperty({
    description: 'Correct to_city_id',
  })
  @IsUUID()
  @IsNotEmpty()
  to_city_id: string;

  @ApiProperty({
    description: 'Correct start_flight_date',
  })
  @IsNotEmpty()
  start_flight_date: Date;

  @ApiProperty({
    description: 'Correct end_flight_date',
  })
  @IsNotEmpty()
  end_flight_date: Date;

  @ApiProperty({
    description: 'Correct status',
  })
  @IsString()
  @IsNotEmpty()
  status: FlightStatus;

  @ApiProperty({
    description: 'Correct price',
  })
  @IsInt()
  price: number;

  @ApiProperty({
    description: 'Correct available_seats',
  })
  @IsInt()
  available_seats: number;

  @ApiProperty({
    description: 'Correct plane_id',
  })
  @IsUUID()
  @IsNotEmpty()
  plane_id: string;

  @ApiProperty({
    description: 'from_city',
  })
  from_city: CityDto;


  @ApiProperty({
    description: 'to_city',
  })
  to_city: CityDto;

  
  @ApiProperty({
    description: 'plane',
  })
  plane: PlaneDto;

  static toEntity(entity?: FlightDto) {
    const it = {
      from_city_id: entity.from_city_id,
      to_city_id: entity.to_city_id,
      start_flight_date: entity.start_flight_date.valueOf(),
      end_flight_date: entity.end_flight_date.valueOf(),
      status: entity.status,
      price: entity.price,
      available_seats: entity.available_seats,
      plane_id: entity.plane_id,
      from_city: CityDto.toEntity(entity.from_city),
      to_city: CityDto.toEntity(entity.to_city),
      plane: PlaneDto.toEntity(entity.plane),
    };
    return it;
  }
  static toEntities(arr?: FlightDto[]) {
    const it = arr.map((order) => this.toEntity(order));
    return it;
  }
}
