import { IsEmail } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsStrongPassword,
  IsUUID,
  validate,
} from "class-validator";
import {
  EmailErrorMessage,
  StrongPasswordErrorMessage,
  UuidErrorMessage,
} from "@app/exceptions/i18n-error";

export class SignInForm {
  @ApiProperty({
    description: "email",
  })
  @IsEmail()
  @IsEmail(undefined, {
    message: EmailErrorMessage,
  })
  email: string;

  @ApiProperty({
    description: "password",
  })
  @IsStrongPassword(undefined, { message: StrongPasswordErrorMessage })
  password: string;

  @ApiProperty({
    description: "device id",
  })
  @IsUUID(undefined, {
    message: UuidErrorMessage,
  })
  device_id!: string;

  static from(form?: SignInForm) {
    const it = new SignInForm();
    it.email = form?.email;
    it.password = form?.password;
    it.device_id = form?.device_id;
    return it;
  }

  static async validate(form: SignInForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
