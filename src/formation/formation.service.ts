/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { FilterFormationDto } from './dto/filter-formation.dto';
import { UserWithRole } from 'src/user/types'; // <--- On importe notre type propre

@Injectable()
export class FormationService {
  constructor(private prisma: PrismaService) {} // <--- Plus besoin d'AuthorizationService

  async create(dto: CreateFormationDto, user: UserWithRole) {
    // Seuls DG et COUNTRY_MANAGER peuvent créer
    if (user.role.name !== 'DIRECTEUR_GENERAL' && user.role.name !== 'COUNTRY_MANAGER') {
      throw new ForbiddenException('Vous n’êtes pas autorisé à créer une formation');
    }

    return this.prisma.formation.create({
      data: {
        ...dto,
        createdById: user.id,
      },
    });
  }

  async findAll(filter: FilterFormationDto, user: UserWithRole) {
    const where: any = {};

    // Filtrage par pays pour les Country Managers
    if (user.role.name === 'COUNTRY_MANAGER') {
      where.country = user.country;
    }
    // Le Sales Officer ne voit pas les formations, sauf si on veut changer la logique.
    // Pour l'instant, il n'a pas la permission 'formations:read', donc il ne passera jamais le guard.

    if (filter.search) {
      where.name = { contains: filter.search, mode: 'insensitive' };
    }
    if (filter.country) where.country = filter.country;
    if (filter.status) where.status = filter.status;

    return this.prisma.formation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: UserWithRole) {
    const formation = await this.prisma.formation.findUnique({ where: { id } });
    if (!formation) throw new ForbiddenException('Formation introuvable');

    // Le DG voit tout. Le CM ne voit que les formations de son pays.
    if (user.role.name !== 'DIRECTEUR_GENERAL' && formation.country !== user.country) {
      throw new ForbiddenException('Accès non autorisé');
    }
    
    return formation;
  }

  async update(id: string, dto: UpdateFormationDto, user: UserWithRole) {
    // On réutilise la logique de findOne pour vérifier l'accès
    await this.findOne(id, user); // Lèvera une exception si non autorisé

    return this.prisma.formation.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, user: UserWithRole) {
    // On réutilise la logique de findOne pour vérifier l'accès
    await this.findOne(id, user); // Lèvera une exception si non autorisé

    // Soft delete
    return this.prisma.formation.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  // --- Les méthodes de statistiques n'ont pas besoin de changer ---
  // Elles sont protégées au niveau du contrôleur par les permissions.

  async countByCountry() {
    return this.prisma.formation.groupBy({
      by: ['country'],
      _count: { id: true },
    });
  }

  async countByManager() {
    return this.prisma.formation.groupBy({
      by: ['createdById'],
      _count: { id: true },
    });
  }

  async totalCount() {
    return this.prisma.formation.count();
  }

  async countProspectsByFormation() {
    const formations = await this.prisma.formation.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { prospects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return formations.map((f) => ({
      id: f.id,
      name: f.name,
      totalProspects: f._count.prospects,
    }));
  }

  async countProspectsByFormationAndCountry(country: string) {
    const formations = await this.prisma.formation.findMany({
      where: { country },
      select: {
        id: true,
        name: true,
        country: true,
        _count: {
          select: { prospects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return formations.map((f) => ({
      id: f.id,
      name: f.name,
      country: f.country,
      totalProspects: f._count.prospects,
    }));
  }
}
