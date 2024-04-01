import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { v4 } from "uuid";

export class MessageDto {
  @IsUUID()
  @IsNotEmpty()
  id?: string;
  @IsNotEmpty()
  @IsString()
  message!: string;
  @IsNotEmpty()
  @IsString()
  first_name!: string;
  @IsNotEmpty()
  @IsString()
  last_name!: string;
  @IsNotEmpty()
  @IsUUID()
  room_id: string;
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
  @IsNotEmpty()
  @IsNumber()
  created_at?: Date;

  static toEntity(entity?: MessageDto) {
    const it = {
      id: entity?.id || v4(),
      message: entity.message,
      room_id: entity.room_id,
      first_name: entity.first_name,
      last_name: entity.last_name,
      user_id: entity.user_id,
      created_at: entity?.created_at ,
    };

    return it;
  }

  static toEntities(arr?: MessageDto[]) {
    const it = arr.map((message) => this.toEntity(message));
    return it;
  }
}
