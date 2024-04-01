import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class DevicesDto {
    @ApiProperty({
        description: 'device id',
    })
    @IsUUID()
    id: string;

    @ApiProperty({
        description: 'device created_at',
    })
    @IsDate()
    created_at: Date;

    @ApiProperty({
        description: 'device updated_at',
    })
    @IsDate()
    updated_at: Date;

    @ApiProperty({
        description: 'device user_id',
    })
    @IsUUID()
    user_id: string;

    @ApiProperty({
        description: 'device device_id',
    })
    @IsUUID()
    device_id: string;

    @ApiProperty({
        description: 'device reset_token',
    })
    reset_token: string | null;

    static toEntity(entity?: DevicesDto) {
        const it = {
            id: entity.id,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
            user_id: entity.user_id,
            device_id: entity.device_id,
            reset_token: entity.reset_token,
        };
        return it;
    }
    static toEntities(arr?: DevicesDto[]) {
        const it = arr.map((city) => this.toEntity(city));
        return it;
    }
}
