import { Injectable } from '@nestjs/common';
import { Device, Role, User, UserRoles } from '@prisma/client';
import { PrismaService } from '@app/prisma';

@Injectable()
export class DeviceReposService {
  constructor(private prisma: PrismaService) { }
  async updateSession(user: User, { device_id }: Pick<Device, 'device_id'>) {
    return this.prisma.device.upsert({
      where: {
        user_id_device_id: {
          user_id: user.id,
          device_id,
        },
      },
      create: {
        user_id: user.id,
        device_id,
      },
      update: {
        user_id: user.id,
        device_id,
      },
    });
  }

  async findSessionByEmail(
    data: Pick<User, 'email'>
  ) {
    return this.prisma.device.findFirst({
      where: {
        user: { email: data.email },
      },
      include: { user: true },
    });
  }

  async findSessionByUserIdAndDeviceId(
    data: Pick<User, 'id'> & Pick<Device, 'device_id'>
  ) {
    return this.prisma.device.findUnique({
      where: {
        user_id_device_id: {
          device_id: data.device_id,
          user_id: data.id,
        },
      },
      include: { user: true },
    });
  }

  async deleteRecord(user: User, { device_id }: Pick<Device, 'device_id'>) {
    return this.prisma.device.delete({
      where: { user_id_device_id: { user_id: user.id, device_id } },
    });
  }

  async findByResetToken(
    data: Pick<Device, 'device_id' | 'reset_token'>
  ) {
    return await this.prisma.device.findUnique({
      where: {
        device_id_reset_token: {
          device_id: data.device_id,
          reset_token: data.reset_token,
        },
      },
      include: { user: true },
    });
  }

  async updateResetToken(
    data: Pick<Device, 'user_id'> & Pick<Device, 'device_id' | 'reset_token'>
  ) {
    return this.prisma.device.upsert({
      where: {
        user_id_device_id: {
          user_id: data.user_id,
          device_id: data.device_id,
        },
      },
      create: {
        reset_token: data.reset_token,
        user_id: data.user_id,
        device_id: data.device_id,
      },
      update: {
        reset_token: data.reset_token,
        user_id: data.user_id,
        device_id: data.device_id,
      },
    });
  }

  async deleteResetToken(user: Partial<User>, { device_id }: Pick<Device, 'device_id'>) {
    return this.prisma.device.update({
      where: {
        user_id_device_id: {
          user_id: user.id,
          device_id,
        },
      },
      data: {
        reset_token: null,
      },
    });
  }
  async getRoleById({ id }: Pick<Role, 'id'>) {
    return this.prisma.role.findUnique({ where: { id } })
  }
  async signoutSessions(user: Partial<User>, { device_id }: Pick<Device, 'device_id'>) {
    return this.prisma.device.deleteMany({
      where: {
        user_id: user.id,
        device_id: {
          not: device_id
        }
      },
    });
  }
  async signoutOneSession(user: Partial<User>, { device_id }: Pick<Device, 'device_id'>) {
    return this.prisma.device.delete({
      where: {
        user_id_device_id: {
          user_id: user.id,
          device_id
        }
      },
    });
  }
  async getUserDevices({ id }: Pick<User, 'id'>) {
    return this.prisma.device.findMany({
      where: {
        user_id: id
      }
    })
  }
}
