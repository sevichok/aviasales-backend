import { IsEmail } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FlightStatus } from '@prisma/client';
import { IsInt, IsNotEmpty, IsString, IsUUID, validate } from 'class-validator';

export class ChangeFlightPrice {
    @ApiProperty({
        description: 'flight id',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: 'price',
    })
    @IsInt()
    price: number;

    static from(form?: ChangeFlightPrice) {
        const it = new ChangeFlightPrice()
        it.id = form?.id;
        it.price = form?.price;
        return it;
    }

    static async validate(form: ChangeFlightPrice) {
        const errors = await validate(form);
        return errors.length ? errors : false;
    }
}
