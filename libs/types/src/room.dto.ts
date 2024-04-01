import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class RoomDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  first_name: string;
  @IsString()
  @IsNotEmpty()
  last_name: string;

    static toEntity(entity?: RoomDto) {
        const it = {
            id: entity.id,
            first_name: entity.first_name,
            last_name: entity.last_name
        };
        return it;
    }
    static toEntities(arr?: RoomDto[]) {
        const it = arr.map((room) => this.toEntity(room));
        return it;
    }
}