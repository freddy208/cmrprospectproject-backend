/* eslint-disable no-unused-vars */
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthorizationService } from '../common/authorization/authorization.service';

import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { FilterFormationDto } from './dto/filter-formation.dto';
import { User } from '@prisma/client';

@Injectable()
export class FormationService {
  constructor(
    private prisma: PrismaService,
    private authorizationService: AuthorizationService,
  ) {}

  async create(dto: CreateFormationDto, user: User) {
    // Seuls DIRECTOR et COUNTRY_MANAGER peuvent créer
    if (!this.authorizationService.canCreateFormation(user)) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à créer une formation',
      );
    }

    return this.prisma.formation.create({
      data: {
        ...dto,
        createdById: user.id,
      },
    });
  }

  async findAll(filter: FilterFormationDto, user: User) {
    const where: any = {};

    // Filtrage par pays pour les Country Managers
    if (this.authorizationService.isCountryManager(user)) {
      where.country = user.country;
    }

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

  async findOne(id: string, user: User) {
    const formation = await this.prisma.formation.findUnique({ where: { id } });
    if (!formation) throw new ForbiddenException('Formation introuvable');

    if (!this.authorizationService.canAccessFormation(user, formation)) {
      throw new ForbiddenException('Accès non autorisé');
    }
    return formation;
  }

  async update(id: string, dto: UpdateFormationDto, user: User) {
    const formation = await this.prisma.formation.findUnique({ where: { id } });
    if (!formation) throw new ForbiddenException('Formation introuvable');

    if (!this.authorizationService.canUpdateFormation(user, formation)) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier cette formation',
      );
    }

    return this.prisma.formation.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, user: User) {
    const formation = await this.prisma.formation.findUnique({ where: { id } });
    if (!formation) throw new ForbiddenException('Formation introuvable');

    if (!this.authorizationService.canDeleteFormation(user, formation)) {
      throw new ForbiddenException('Suppression non autorisée');
    }

    // Soft delete
    return this.prisma.formation.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  // 🔢 Comptages utiles
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

    // On reformate pour que ce soit propre dans la réponse
    return formations.map((f) => ({
      id: f.id,
      name: f.name,
      totalProspects: f._count.prospects,
    }));
  }

  // Compte le nombre de prospects par formation pour un pays donné
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
