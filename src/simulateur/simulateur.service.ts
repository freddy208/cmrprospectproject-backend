/* eslint-disable no-unused-vars */
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSimulateurDto } from './dto/create-simulateur.dto';
import { UpdateSimulateurDto } from './dto/update-simulateur.dto';
import { FilterSimulateurDto } from './dto/filter-simulateur.dto';
import { UserWithRole } from 'src/user/types'; // <--- On importe notre type propre

@Injectable()
export class SimulateurService {
  constructor(private prisma: PrismaService) {} // <--- Plus besoin d'AuthorizationService

  async create(dto: CreateSimulateurDto, user: UserWithRole) {
    // Seuls DG et COUNTRY_MANAGER peuvent créer
    if (
      user.role.name !== 'DIRECTEUR_GENERAL' &&
      user.role.name !== 'COUNTRY_MANAGER'
    ) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à créer un simulateur',
      );
    }

    return this.prisma.simulateur.create({
      data: {
        ...dto,
        createdById: user.id,
      },
    });
  }

  async findAll(filter: FilterSimulateurDto, user: UserWithRole) {
    const where: any = { status: 'ACTIVE' };

    // Country Manager voit seulement les simulateurs de son pays
    if (user.role.name === 'COUNTRY_MANAGER') {
      where.country = user.country;
    }
    // Le Sales Officer n'a pas la permission 'simulateurs:read', il ne passera donc pas le guard.

    if (filter.search) {
      where.name = { contains: filter.search, mode: 'insensitive' };
    }
    if (filter.country) where.country = filter.country;
    if (filter.status) where.status = filter.status;

    return this.prisma.simulateur.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, country: true },
        },
      },
    });
  }

  async findOne(id: string, user: UserWithRole) {
    const sim = await this.prisma.simulateur.findUnique({ where: { id } });
    if (!sim) throw new NotFoundException('Simulateur introuvable');

    // Le DG voit tout. Le CM ne voit que les simulateurs de son pays.
    if (
      user.role.name !== 'DIRECTEUR_GENERAL' &&
      sim.country !== user.country
    ) {
      throw new ForbiddenException('Accès non autorisé');
    }
    return sim;
  }

  async update(id: string, dto: UpdateSimulateurDto, user: UserWithRole) {
    // On réutilise la logique de findOne pour vérifier l'accès
    await this.findOne(id, user); // Lèvera une exception si non autorisé

    return this.prisma.simulateur.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string, user: UserWithRole) {
    // On réutilise la logique de findOne pour vérifier l'accès
    await this.findOne(id, user); // Lèvera une exception si non autorisé

    // Soft delete
    return this.prisma.simulateur.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  // --- Les méthodes de statistiques n'ont pas besoin de changer ---
  // Elles sont protégées au niveau du contrôleur par les permissions.

  async countByCountry() {
    return this.prisma.simulateur.groupBy({
      by: ['country'],
      _count: { id: true },
    });
  }

  async countByManager() {
    return this.prisma.simulateur.groupBy({
      by: ['createdById'],
      _count: { id: true },
    });
  }

  async totalCount() {
    //return this.prisma.simulateur.count();
    return { count: await this.prisma.simulateur.count() };
  }

  async countProspectsBySimulateur() {
    const sims = await this.prisma.simulateur.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        _count: { select: { prospects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sims.map((s) => ({
      id: s.id,
      name: s.name,
      country: s.country,
      totalProspects: s._count.prospects,
    }));
  }

  async countProspectsBySimulateurAndCountry(country: string) {
    const sims = await this.prisma.simulateur.findMany({
      where: { country },
      select: {
        id: true,
        name: true,
        country: true,
        _count: { select: { prospects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sims.map((s) => ({
      id: s.id,
      name: s.name,
      country: s.country,
      totalProspects: s._count.prospects,
    }));
  }
}
