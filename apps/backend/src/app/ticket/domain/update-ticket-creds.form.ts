import { IsNotEmpty, IsString, IsUUID, validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketCredsForm {
  @ApiProperty({
    description: 'ticket id',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'ticket first name',
  })
  @IsString()
  @IsNotEmpty()
  holder_first_name: string;

  @ApiProperty({
    description: 'ticket last name',
  })
  @IsString()
  @IsNotEmpty()
  holder_last_name: string;

  static from(form: UpdateTicketCredsForm) {
    if (!form) {
      return;
    }
    const it = new UpdateTicketCredsForm();
    it.id = form.id;
    it.holder_first_name = form.holder_first_name;
    it.holder_last_name = form.holder_last_name;
    return it;
  }

  static async validate(form: UpdateTicketCredsForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
