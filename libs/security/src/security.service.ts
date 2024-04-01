import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Device, Role, User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { UsersReposService } from "@/backend/domain/repos/user-repos.service";
import { RolesReposService } from "@/backend/domain/repos/roles-repos.service";
import { DeviceReposService } from "@/backend/domain/repos/device-repos.service";
import { user_id } from "@/backend/types/user-id.type";

@Injectable()
export class SecurityService {
  constructor(
    private jwtService: JwtService,
    private usersRepos: UsersReposService,
    private rolesRepos: RolesReposService,
    private deviceRepo: DeviceReposService,
    private deviceRepos: DeviceReposService,
    private config: ConfigService,
  ) {}

  async generateTokens(
    user: Pick<User, "id" | "role_id" | "email" | "role_type">,
    device_id: Pick<Device, "device_id">,
  ) {
    const payload = {
      email: user.email,
      id: user.id,
      role_id: user.role_id,
      role_type: user.role_type,
      device_id: device_id.device_id,
    };
    const access_token = this.jwtService.sign(payload, {
      secret: this.config.get("security").secret,
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.config.get("security").secret,
    });
    return { access_token, refresh_token };
  }

  async refresh(user: User, device_id: Pick<Device, "device_id">) {
    const tokens = await this.generateTokens(user, device_id);
    await this.deviceRepos.updateSession(user, device_id);

    return tokens;
  }

  async getUserById(id: user_id) {
    return this.usersRepos.getOneUserById(id);
  }

  async getManagerById(id: user_id) {
    return this.usersRepos.getManagerById(id);
  }

  async findSessionByUserIdAndDeviceId(
    data: Pick<User, "id"> & Pick<Device, "device_id">,
  ) {
    return await this.deviceRepo.findSessionByUserIdAndDeviceId(data);
  }
  async getRoleById(id: Pick<Role, "id">) {
    return this.rolesRepos.getRoleById(id);
  }

  async hashPassword({ password }: Pick<User, "password">) {
    // Method generates hashed password with SHA256
    const salt = 5;
    return await bcrypt.hash(password, salt);
  }
}
