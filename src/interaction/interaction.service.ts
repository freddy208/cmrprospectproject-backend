/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { FilterInteractionDto } from './dto/filter-interaction.dto';
import { UserWithRole } from 'src/user/types'; // <--- On importe notre type propre

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  async create(user: UserWithRole, dto: CreateInteractionDto) {
    // La logique de création est simple : un utilisateur crée une interaction pour lui-même.
    return this.prisma.interaction.create({
      data: {
        ...dto,
        userId: user.id,
      },
    });
  }

  async update(user: UserWithRole, id: string, dto: UpdateInteractionDto) {
    const interaction = await this.prisma.interaction.findUnique({ where: { id } });
    if (!interaction) throw new NotFoundException('Interaction non trouvée');

    // --- SÉCURITÉ CRUCIALE ---
    // Un utilisateur ne peut modifier que ses propres interactions, sauf le DG.
    if (user.role.name !== 'DIRECTEUR_GENERAL' && interaction.userId !== user.id) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette interaction');
    }

    return this.prisma.interaction.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: UserWithRole, id: string) {
    const interaction = await this.prisma.interaction.findUnique({ where: { id } });
    if (!interaction) throw new NotFoundException('Interaction non trouvée');

    // --- SÉCURITÉ CRUCIALE ---
    // Un utilisateur ne peut supprimer que ses propres interactions, sauf le DG.
    if (user.role.name !== 'DIRECTEUR_GENERAL' && interaction.userId !== user.id) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer cette interaction');
    }

    return this.prisma.interaction.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async findAll(filterDto: FilterInteractionDto, user: UserWithRole) {
    const where: any = { status: 'ACTIVE' };

    // --- LOGIQUE DE FILTRAGE PAR RÔLE ---
    if (user.role.name === 'SALES_OFFICER') {
      // Le Sales Officer ne voit que ses propres interactions
      where.userId = user.id;
    } else if (user.role.name === 'COUNTRY_MANAGER') {
      // Le CM voit les interactions liées aux prospects de son pays
      // On doit filtrer via la relation `prospect`
      where.prospect = { country: user.country };
    }
    // Le DG voit tout (pas de filtre supplémentaire)

    // Appliquer les filtres de recherche
    if (filterDto.prospectId) where.prospectId = filterDto.prospectId;
    if (filterDto.userId) where.userId = filterDto.userId;
    if (filterDto.channel) where.channel = filterDto.channel;
    if (filterDto.type) where.type = { contains: filterDto.type, mode: 'insensitive' };
    if (filterDto.notes) where.notes = { contains: filterDto.notes, mode: 'insensitive' };

    return this.prisma.interaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        prospect: { select: { id: true, email: true, firstName: true, lastName: true, country: true } }
      },
    });
  }

  async countByProspect(prospectId: string, user: UserWithRole) {
    // --- SÉCURITÉ ---
    // On doit vérifier que l'utilisateur a le droit de voir ce prospect.
    const prospect = await this.prisma.prospect.findUnique({ where: { id: prospectId } });
    if (!prospect) throw new NotFoundException('Prospect non trouvé');

    if (user.role.name !== 'DIRECTEUR_GENERAL' && prospect.country !== user.country) {
        throw new ForbiddenException('Accès non autorisé à ce prospect');
    }

    return this.prisma.interaction.count({
      where: { prospectId, status: 'ACTIVE' },
    });
  }

  async countByUser(userId: string, user: UserWithRole) {
    // --- SÉCURITÉ ---
    // Un utilisateur ne peut voir les stats que de lui-même, sauf le DG.
    if (user.role.name !== 'DIRECTEUR_GENERAL' && userId !== user.id) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return this.prisma.interaction.count({
      where: { userId, status: 'ACTIVE' },
    });
  }
}