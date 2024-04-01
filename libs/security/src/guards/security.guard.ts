import {
  CanActivate,
  ExecutionContext,
  Injectable,
  createParamDecorator,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissions, UserRoles } from '@prisma/client';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { SecurityService } from '@app/security';
import { UserSessionDto } from '@app/security/dtos/UserSessionDto';
import { ErrorCodes } from '@app/exceptions/enums/error-codes.enum';
import { ApiException } from '@app/libs/exceptions/src/api-exception';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserSessionDto;
  }
);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private securityService: SecurityService
  ) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride<
      UserPermissions[]
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    const contextType = context.getType();
    let authHeader, decodedUser;
    switch (contextType) {
      case 'http':
        const request = context.switchToHttp().getRequest();
        authHeader = request.headers?.authorization;

        if (!authHeader) {
          throw new UnauthorizedException('Not authorized');
        }

        decodedUser = await this.validateTokenAndGetUser(authHeader);

        request.user = decodedUser.user;
        return this.validatePermissions(decodedUser.user, requiredPermissions);
      case 'ws':
        const client = context.switchToWs().getClient();
        authHeader = client.handshake.headers?.authorization;
        if (!authHeader) {
          throw new UnauthorizedException('Not authorized');
        }

        decodedUser = await this.validateTokenAndGetUser(authHeader);
        client.data.user = decodedUser.user;
        return this.validatePermissions(decodedUser.user, requiredPermissions);
      default:
        return false;
    }
  }

  private async validateTokenAndGetUser(authHeader: string) {
    const token = authHeader.split(' ')[1];
    const decodedUser = UserSessionDto.fromPayload(
      this.jwtService.verify(token)
    );
    const user =
      await this.securityService.findSessionByUserIdAndDeviceId(decodedUser);
    if (!user) {
      throw new UnauthorizedException(ErrorCodes.NotAuthorizedRequest);
    }
    return user;
  }

  private async validatePermissions(
    user: UserSessionDto,
    requiredPermissions: UserPermissions[]
  ): Promise<boolean> {
    const roleEntity = await this.securityService.getRoleById({
      id: user.role_id,
    });

    if (!requiredPermissions) {
      return true;
    }

    if (
      roleEntity.type === UserRoles.Admin
      //  || roleEntity.type === UserRoles.Client
    ) {
      return true;
    }

    const hasPermission = requiredPermissions.some(
      (permission) => roleEntity.permissions?.includes(permission)
    );
    console.log(hasPermission, roleEntity.permissions);
    if (!hasPermission) {
      throw new ApiException(ErrorCodes.NotAuthorizedRequest);
    }

    return true;
  }
}
