import { IsEmail } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID, validate } from "class-validator";
import { UuidErrorMessage } from "@app/exceptions/i18n-error";

export class SignoutForm {
  @ApiProperty({
    description: "device id",
  })
  @IsUUID(undefined, {
    message: UuidErrorMessage,
  })
  device_id: string;

  static from(form?: SignoutForm) {
    const it = new SignoutForm();
    it.device_id = form?.device_id;
    return it;
  }

  static async validate(form: SignoutForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
