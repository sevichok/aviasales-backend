import { IsNotEmpty, IsString, IsUUID, validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusForm {
  @ApiProperty({
    description: 'ticket id',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'ticket status',
  })
  @IsString()
  @IsNotEmpty()
  status: TicketStatus;

  static from(form: UpdateTicketStatusForm) {
    if (!form) {
      return;
    }
    const it = new UpdateTicketStatusForm();
    it.id = form.id;
    it.status = form.status;
    return it;
  }

  static async validate(form: UpdateTicketStatusForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
