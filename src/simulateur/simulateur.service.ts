/* eslint-disable no-unused-vars */
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthorizationService } from 'src/common/authorization/authorization.service';
import { CreateSimulateurDto } from './dto/create-simulateur.dto';
import { UpdateSimulateurDto } from './dto/update-simulateur.dto';
import { FilterSimulateurDto } from './dto/filter-simulateur.dto';
import { User } from '@prisma/client';

@Injectable()
export class SimulateurService {
  constructor(
    private prisma: PrismaService,
    private authorizationService: AuthorizationService,
  ) {}

  // Create (DG + Country Manager)
  async create(dto: CreateSimulateurDto, user: User) {
    if (!this.authorizationService.canCreateSimulateur(user)) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à créer un simulateur',
      );
    }

    return this.prisma.simulateur.create({
      data: {
        name: dto.name,
        monthlyPrice: dto.monthlyPrice,
        description: dto.description,
        country: dto.country,
        createdById: user.id,
      },
    });
  }

  // Find all (applique scope country si nécessaire)
  async findAll(filter: FilterSimulateurDto, user: User) {
    const where: any = { status: 'ACTIVE' };

    // Country Manager voit seulement les simulateurs de son pays
    if (this.authorizationService.isCountryManager(user)) {
      where.country = user.country;
    }

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

  // Find one with access check
  async findOne(id: string, user: User) {
    const sim = await this.prisma.simulateur.findUnique({ where: { id } });
    if (!sim) throw new NotFoundException('Simulateur introuvable');

    if (!this.authorizationService.canAccessSimulateur(user, sim)) {
      throw new ForbiddenException('Accès non autorisé');
    }
    return sim;
  }

  // Update
  async update(id: string, dto: UpdateSimulateurDto, user: User) {
    const sim = await this.prisma.simulateur.findUnique({ where: { id } });
    if (!sim) throw new NotFoundException('Simulateur introuvable');

    if (!this.authorizationService.canUpdateSimulateur(user, sim)) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce simulateur');
    }

    return this.prisma.simulateur.update({
      where: { id },
      data: { ...dto },
    });
  }

  // Soft delete
  async remove(id: string, user: User) {
    const sim = await this.prisma.simulateur.findUnique({ where: { id } });
    if (!sim) throw new NotFoundException('Simulateur introuvable');

    if (!this.authorizationService.canDeleteSimulateur(user, sim)) {
      throw new ForbiddenException('Suppression non autorisée');
    }

    return this.prisma.simulateur.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  // Stats: count by country
  async countByCountry() {
    return this.prisma.simulateur.groupBy({
      by: ['country'],
      _count: { id: true },
    });
  }

  // Stats: count by manager (createdById)
  async countByManager() {
    return this.prisma.simulateur.groupBy({
      by: ['createdById'],
      _count: { id: true },
    });
  }

  // Total count
  async totalCount() {
    return this.prisma.simulateur.count();
  }

  // Count prospects per simulateur (global)
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

  // Count prospects per simulateur filtered by country
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
