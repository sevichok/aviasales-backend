import { IsNotEmpty, IsString, validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CityForm {
  @ApiProperty({
    description: 'city title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  static from(form: CityForm) {
    if (!form) {
      return;
    }
    const it = new CityForm();
    it.title = form.title;
    return it;
  }

  static async validate(form: CityForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
