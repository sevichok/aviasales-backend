import { IsEmail, IsUUID } from "class-validator";
import { validate } from "class-validator";
import {
  EmailErrorMessage,
  UuidErrorMessage,
} from "@app/exceptions/i18n-error";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordForm {
  @ApiProperty({
    description: "device id",
  })
  @IsUUID()
  @IsUUID(undefined, {
    message: UuidErrorMessage,
  })
  device_id: string;

  @ApiProperty({
    description: "email",
  })
  @IsEmail()
  @IsEmail(undefined, {
    message: EmailErrorMessage,
  })
  email: string;

  static from(dto: ForgotPasswordForm) {
    const it = new ForgotPasswordForm();
    it.email = dto.email;
    it.device_id = dto.device_id;
    return it;
  }

  static async validate(form: ForgotPasswordForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
