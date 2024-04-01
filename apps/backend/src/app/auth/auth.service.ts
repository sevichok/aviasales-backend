import { Injectable } from "@nestjs/common";
import { SecurityService } from "@app/security";
import { Device, User, UserRoles } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { v4 } from "uuid";
import { UsersReposService } from "@/backend/domain/repos/user-repos.service";
import { DeviceReposService } from "@/backend/domain/repos/device-repos.service";
import { RolesReposService } from "@/backend/domain/repos/roles-repos.service";

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersReposService,
    private deviceRepo: DeviceReposService,
    private rolesRepo: RolesReposService,
    private securityService: SecurityService,
  ) {}

  async generateTokens(user: User, device_id: Pick<Device, "device_id">) {
    const tokens = await this.securityService.generateTokens(user, device_id);
    return tokens;
  }
  async getUserByEmail(email: Pick<User, "email">) {
    const user = await this.usersRepo.getUserByEmail(email);
    return user;
  }

  async getAdminByEmail(email: Pick<User, "email">) {
    return this.usersRepo.getAdminByEmail(email);
  }

  async comparePassword(user: User, password: Pick<User, "password">) {
    const isCompare = await bcrypt.compare(password.password, user.password);
    return isCompare;
  }

  async findSessionByEmail(data: Pick<User, "email">) {
    return await this.usersRepo.getUserByEmail(data);
  }

  async setResetToken(user: User, session: Pick<Device, "device_id">) {
    const token = v4();
    await this.deviceRepo.updateResetToken({
      user_id: user.id,
      device_id: session.device_id,
      reset_token: token,
    });
    return token;
  }

  async signUp(
    data: Pick<User, "email" | "password" | "first_name" | "last_name"> &
      Pick<Device, "device_id">,
  ) {
    const role = await this.rolesRepo.getRole(UserRoles.Client);
    const password = await this.securityService.hashPassword(data);
    const user = await this.usersRepo.createUser(data, role, { password });
    await this.deviceRepo.updateSession(user, data);
    return user;
  }

  async signout(user: User, device_id: Pick<Device, "device_id">) {
    return await this.deviceRepo.deleteRecord(user, device_id);
  }

  async signoutSessions(user: User, device_id: Pick<Device, "device_id">) {
    return await this.deviceRepo.signoutSessions(user, device_id);
  }
  async signoutOneSession(user: User, device_id: Pick<Device, "device_id">) {
    return await this.deviceRepo.signoutOneSession(user, device_id);
  }
  async authenticate(user: User, device_id: Pick<Device, "device_id">) {
    const tokens = await this.securityService.generateTokens(user, device_id);
    await this.deviceRepo.updateSession(user, device_id);
    return tokens;
  }

  async findSessionByResetToken(
    data: Pick<Device, "device_id" | "reset_token">,
  ) {
    return await this.deviceRepo.findByResetToken(data);
  }

  async changePassword(user: User, data: Pick<User, "password">) {
    const password = await this.securityService.hashPassword(data);
    return await this.usersRepo.changePassword(user, { password });
  }

  async deleteResetToken(
    user: Partial<User>,
    device_id: Pick<Device, "device_id">,
  ) {
    return await this.deviceRepo.deleteResetToken(user, device_id);
  }
}
