import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CityDto {
  @ApiProperty({
    description: 'Сity id',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Сity title',
  })
  @IsString()
  title: string;

  static toEntity(entity?: CityDto) {
    const it = {
      id: entity.id,
      title: entity.title,
    };
    return it;
  }
  static toEntities(arr?: CityDto[]) {
    const it = arr.map((order) => this.toEntity(order));
    return it;
  }
}
