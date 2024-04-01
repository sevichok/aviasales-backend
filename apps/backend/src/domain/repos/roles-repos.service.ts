import { Injectable } from '@nestjs/common';
import { Role, UserPermissions, UserRoles } from '@prisma/client';
import { PrismaService } from "@app/prisma";

@Injectable()
export class RolesReposService {
    constructor(private prisma: PrismaService) { }
    async getRole(type: UserRoles) {
        return this.prisma.role.findFirst({ where: { type } })
    }
    async createRole(type: UserRoles) {
        return this.prisma.role.create({
            data: {
                type,
                permissions: [UserPermissions.All]
            }
        })
    }
    async getRoleById({ id }: Pick<Role, 'id'>) {
        return this.prisma.role.findUnique({ where: { id } })
    }
}