import {IsNotEmpty, IsUUID, validate} from "class-validator";

export class RoomForm {
  @IsUUID()
  @IsNotEmpty()
  room_id: string;

    static from(form?: RoomForm) {
        const it = new RoomForm();
        it.room_id = form?.room_id;
        return it;
    }

    static async validate(form: RoomForm) {
        const errors = await validate(form);
        return errors.length ? errors : false;
    }
}