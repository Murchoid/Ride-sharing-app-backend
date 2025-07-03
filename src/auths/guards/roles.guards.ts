import { Request } from 'express';
import { JWTPayload } from '../strategies';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface IUserRequest extends Request {
  user?: JWTPayload;
}

enum eROLE {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requestedRoles = this.reflector.getAllAndOverride<eROLE[]>(
      ROLES_KEY,
      [context.getClass(), context.getHandler()],
    );

    if (!requestedRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IUserRequest>();
    const { user } = request;

    if (!user) {
      return false;
    }

    return requestedRoles.some((role) => user.role === role);
  }
}
