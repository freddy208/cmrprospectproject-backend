/* eslint-disable no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FilterCommentDto } from './dto/filter-comment.dto';
import { UserWithRole } from 'src/user/types'; // <--- On importe notre type propre

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(user: UserWithRole, dto: CreateCommentDto) {
    // La logique de création est simple : un utilisateur crée un commentaire pour lui-même.
    return this.prisma.comment.create({
      data: {
        ...dto,
        userId: user.id,
      },
    });
  }

  async update(user: UserWithRole, id: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Commentaire non trouvé');

    // --- SÉCURITÉ CRUCIALE ---
    // Un utilisateur ne peut modifier que ses propres commentaires, sauf le DG.
    if (user.role.name !== 'DIRECTEUR_GENERAL' && comment.userId !== user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier ce commentaire',
      );
    }

    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
    });
  }

  async remove(user: UserWithRole, id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Commentaire non trouvé');

    // --- SÉCURITÉ CRUCIALE ---
    // Un utilisateur ne peut supprimer que ses propres commentaires, sauf le DG.
    if (user.role.name !== 'DIRECTEUR_GENERAL' && comment.userId !== user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer ce commentaire',
      );
    }

    return this.prisma.comment.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async findAll(filterDto: FilterCommentDto, user: UserWithRole) {
    const where: any = { status: 'ACTIVE' };

    // --- LOGIQUE DE FILTRAGE PAR RÔLE ---
    if (user.role.name === 'SALES_OFFICER') {
      // Le Sales Officer ne voit que ses propres commentaires
      where.userId = user.id;
    } else if (user.role.name === 'COUNTRY_MANAGER') {
      // Le CM voit les commentaires liés aux prospects de son pays
      // On doit filtrer via la relation `prospect`
      where.prospect = { country: user.country };
    }
    // Le DG voit tout (pas de filtre supplémentaire)

    // Appliquer les filtres de recherche
    if (filterDto.prospectId) where.prospectId = filterDto.prospectId;
    if (filterDto.userId) where.userId = filterDto.userId;
    if (filterDto.content)
      where.content = { contains: filterDto.content, mode: 'insensitive' };

    return this.prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: { select: { name: true } },
          },
        },
        prospect: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            country: true,
          },
        },
      },
    });
  }

  async countByProspect(prospectId: string, user: UserWithRole) {
    // --- SÉCURITÉ ---
    // On doit vérifier que l'utilisateur a le droit de voir ce prospect.
    const prospect = await this.prisma.prospect.findUnique({
      where: { id: prospectId },
    });
    if (!prospect) throw new NotFoundException('Prospect non trouvé');

    if (
      user.role.name !== 'DIRECTEUR_GENERAL' &&
      prospect.country !== user.country
    ) {
      throw new ForbiddenException('Accès non autorisé à ce prospect');
    }

    return this.prisma.comment.count({
      where: { prospectId, status: 'ACTIVE' },
    });
  }

  async countByUser(userId: string, user: UserWithRole) {
    // --- SÉCURITÉ ---
    // Un utilisateur ne peut voir les stats que de lui-même, sauf le DG.
    if (user.role.name !== 'DIRECTEUR_GENERAL' && userId !== user.id) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return this.prisma.comment.count({ where: { userId, status: 'ACTIVE' } });
  }
}
