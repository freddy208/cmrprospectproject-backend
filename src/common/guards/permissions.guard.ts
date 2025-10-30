/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
// src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service'; // Adaptez ce chemin si nécessaire
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService, // On injecte Prisma pour interroger la BDD
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Récupérer les permissions requises depuis le décorateur @Permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(`🔐 PermissionsGuard: Permissions requises = [${requiredPermissions?.join(', ')}]`);

    // 2. Si aucune permission n'est requise, on autorise l'accès
    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('✅ PermissionsGuard: Aucune permission requise, accès autorisé.');
      return true;
    }

    // 3. Récupérer l'utilisateur depuis la requête (injecté par le JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roleId) {
      console.log('❌ PermissionsGuard: Utilisateur ou roleId non trouvé dans la requête.');
      throw new ForbiddenException('Accès refusé : utilisateur non identifié.');
    }

    // 4. Récupérer le rôle de l'utilisateur AVEC ses permissions depuis la base de données
    const roleWithPermissions = await this.prisma.role.findUnique({
      where: { id: user.roleId },
      include: { 
        permissions: {
          select: { name: true } // On ne récupère que le nom des permissions
        } 
      },
    });

    if (!roleWithPermissions) {
      console.log(`❌ PermissionsGuard: Rôle avec l'ID ${user.roleId} non trouvé en base de données.`);
      throw new ForbiddenException('Accès refusé : rôle non valide.');
    }

    // 5. Extraire les noms des permissions de l'utilisateur
    const userPermissionNames = roleWithPermissions.permissions.map(p => p.name);
    console.log(`🔐 PermissionsGuard: Utilisateur '${user.email}' (Rôle: ${roleWithPermissions.name}) a les permissions: [${userPermissionNames.join(', ')}]`);

    // 6. Vérifier si l'utilisateur a TOUTES les permissions requises
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissionNames.includes(permission)
    );

    if (!hasAllPermissions) {
      console.log('❌ PermissionsGuard: Permissions insuffisantes.');
      throw new ForbiddenException('Accès refusé : permissions insuffisantes.');
    }

    console.log('✅ PermissionsGuard: Accès autorisé.');
    return true;
  }
}