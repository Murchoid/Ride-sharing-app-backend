import { SetMetadata } from '@nestjs/common';

enum eROLE {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

export const ROLES_KEY = 'role';
export const ROLES = (...roles: eROLE[]) => SetMetadata(ROLES_KEY, roles);
