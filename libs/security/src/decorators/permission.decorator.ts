import { SetMetadata } from "@nestjs/common";

// ============ Enums ================

export const PERMISSION_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSION_KEY, permissions);