import { Device, User } from "@prisma/client";

export type decoded_user = Pick<User, 'id' | 'email' | 'role_id'> & Pick<Device, 'device_id'>
