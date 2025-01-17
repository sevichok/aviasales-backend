// import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
// import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
//
// @Catch(WsException, HttpException)
// export class WsExceptionFilter extends BaseWsExceptionFilter {
//     catch(exception: WsException | HttpException, host: ArgumentsHost) {
//         const client = host.switchToWs().getClient() as WebSocket;
//         const error = exception instanceof WsException ? exception.getError() : exception.getResponse();
//         const message = exception.message.replace(/\n/g, '');
//         const details = error instanceof Object ? { ...error } : { message: error };
//         client.send(JSON.stringify({
//             event: "error",
//             ...details
//         }));
//     }
// }