/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupère les rôles autorisés définis via le décorateur
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle n'est requis, on autorise l'accès
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Récupère l'utilisateur depuis la requête (injecté par AuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // --- DÉBOGAGE ---
    console.log('🟢 RolesGuard: user.role =', user?.role);
    console.log('🟢 RolesGuard: requiredRoles =', requiredRoles);
    // --- FIN DÉBOGAGE ---

    // Si l'utilisateur n'existe pas, interdit l'accès
    if (!user) {
      console.log('❌ RolesGuard: pas d’utilisateur dans la requête');
      throw new ForbiddenException('Accès refusé');
    }

    // *** LA CORRECTION CRUCIALE ***
    // On compare en string pour éviter les problèmes enum vs string
    const hasRole = requiredRoles.some(role => role.toString() === user.role.toString());

    if (!hasRole) {
      console.log('❌ RolesGuard: rôle non autorisé');
      throw new ForbiddenException('Accès refusé');
    }

    console.log('✅ RolesGuard: accès autorisé');
    return true;
  }
}