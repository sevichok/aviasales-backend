import { UserRoles } from "@prisma/client";
import { IsString, IsUUID } from "class-validator";

export class UserSessionDto {
    @IsUUID()
    id: string;

    @IsString()
    email: string;

    @IsUUID()
    role_id: string;

    role_type: UserRoles
    @IsUUID()
    device_id: string

    public static fromPayload(dto: UserSessionDto): UserSessionDto {

        return {
            id: dto.id,
            email: dto.email,
            role_id: dto.role_id,
            role_type: dto.role_type,
            device_id: dto.device_id
        };
    }
}