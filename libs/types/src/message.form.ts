import { IsNotEmpty, IsString, IsUUID, validate } from "class-validator";

export class MessageForm {
  @IsString()
  @IsNotEmpty()
  message: string;
  // @IsString()
  // @IsNotEmpty()
  // first_name: string;
  // @IsString()
  // @IsNotEmpty()
  // last_name: string;
  @IsUUID()
  @IsNotEmpty()
  user_id: string;
  @IsUUID()
  @IsNotEmpty()
  room_id: string;

  static from(form: MessageForm) {
    if (!form) {
      return;
    }
    const it = new MessageForm();
    it.message = form.message;
    // it.first_name = form.first_name;
    // it.last_name = form.last_name;
    it.room_id = form.room_id;
    it.user_id = form.user_id;
    return it;
  }

  static async validate(form: MessageForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
