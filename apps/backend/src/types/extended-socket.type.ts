import {Socket} from "socket.io";
import {UserSessionDto} from "@app/security/dtos/UserSessionDto";

export interface ExtendedSocketType extends Socket {
    user: UserSessionDto;
}