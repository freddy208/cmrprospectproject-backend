/* eslint-disable no-unused-vars */
// src/administration/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: true, // Inclure les permissions associées
        _count: {
          select: { users: true }, // Inclure le nombre d'utilisateurs ayant ce rôle
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Rôle avec l'ID ${id} non trouvé.`);
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    const { permissionIds, ...roleData } = createRoleDto;

    return this.prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          connect: permissionIds.map((id) => ({ id })), // Connecte les permissions via leurs IDs
        },
      },
      include: { permissions: true },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { permissionIds, ...roleData } = updateRoleDto;

    // Vérifie si le rôle existe
    await this.findOne(id);

    return this.prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        permissions: permissionIds
          ? {
              // `set` est un moyen propre de remplacer complètement la liste des relations
              set: permissionIds.map((id) => ({ id })),
            }
          : undefined, // Si permissionIds n'est pas fourni, on ne touche pas aux permissions
      },
      include: { permissions: true },
    });
  }

  async remove(id: string) {
    // Vérifie si le rôle existe avant de le supprimer
    await this.findOne(id);

    return this.prisma.role.delete({
      where: { id },
    });
  }
}
