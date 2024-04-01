import { IsInt } from "class-validator"
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, validate } from 'class-validator';

export class PlaneDto {
    @ApiProperty({
        description: 'plane id',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: 'plane title',
    })
    @IsString()
    @IsNotEmpty()
    title: string

    @ApiProperty({
        description: 'plane seats',
    })
    @IsInt()
    seats: number

    static toEntity(entity?: PlaneDto) {
        const it = {
            id: entity.id,
            title: entity.title,
            seats: entity.seats,
        }
        return it;
    }
    static toEntities(arr?: PlaneDto[]) {
        const it = arr.map(order => this.toEntity(order))
        return it
    }
}
