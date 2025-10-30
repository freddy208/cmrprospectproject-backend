/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
// src/common/guards/role.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('🟢 RolesGuard: requiredRoles =', requiredRoles);
    console.log('🟢 RolesGuard: requiredRoles types =', requiredRoles.map(r => typeof r));

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    
    console.log('🟢 RolesGuard: user =', user);
    console.log('🟢 RolesGuard: user.role =', user?.role);
    console.log('🟢 RolesGuard: typeof user.role =', typeof user?.role);

    if (!user) {
      console.log("❌ RolesGuard: pas d'utilisateur dans la requête");
      throw new ForbiddenException('Accès refusé');
    }

    // Vérifiez si le rôle de l'utilisateur correspond à l'un des rôles requis
    const hasRole = requiredRoles.some(role => {
      console.log('🔍 Comparaison:', role, '===', user.role, '=>', role === user.role);
      console.log('🔍 role === user.role.toString():', role === user.role?.toString());
      console.log('🔍 role.toString() === user.role:', role.toString() === user.role);
      return role === user.role;
    });

    if (!hasRole) {
      console.log('❌ RolesGuard: rôle non autorisé');
      throw new ForbiddenException('Accès refusé');
    }

    console.log('✅ RolesGuard: accès autorisé');
    return true;
  }
}