import { IsEmail } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FlightStatus } from '@prisma/client';
import { IsNotEmpty, IsString, IsUUID, validate } from 'class-validator';

export class ChangeFlightStatus {
    @ApiProperty({
        description: 'flight id',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: 'status',
    })
    @IsString()
    status: FlightStatus;

    static from(form?: ChangeFlightStatus) {
        const it = new ChangeFlightStatus()
        it.id = form?.id;
        it.status = form?.status;
        return it;
    }

    static async validate(form: ChangeFlightStatus) {
        const errors = await validate(form);
        return errors.length ? errors : false;
    }
}
