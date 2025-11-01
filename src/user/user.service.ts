/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '../config/database.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { UserWithRole } from './types'; // <--- On importe notre nouveau type
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // ... (create, update, remove restent identiques)
  
  async create(dto: CreateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new BadRequestException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    return prisma.user.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    return prisma.user.update({
      where: { id },
      data: { status: 'DELETED', isActive: false },
    });
  }

  // --- MÉTHODES AVEC FILTRAGE ---

  // Liste des utilisateurs avec filtres et recherche ET filtrage par rôle
  async findAll(filter: FilterUserDto, user: UserWithRole) { // <--- On utilise le nouveau type
    const { 
      search, 
      role, 
      country, 
      status, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit,
      offset
    } = filter;

    let whereClause: any = {};

    // Maintenant, TypeScript sait que `user.role` existe !
    if (user.role.name === 'DIRECTEUR_GENERAL') {
      // Le DG voit tout, pas de filtre supplémentaire
    } else if (user.role.name === 'COUNTRY_MANAGER') {
      whereClause.country = user.country;
    } else if (user.role.name === 'SALES_OFFICER') {
      whereClause.id = user.id;
    }

    // Construire les options de requête
    const options: any = {
      where: {
        ...whereClause,
        AND: [
          search
            ? {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          role ? { role: { name: role } } : {},
          country ? { country } : {},
          status ? { status } : {},
          isActive !== undefined ? { isActive } : {},
        ],
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        role: true
      }
    };

    // Ajouter la pagination si nécessaire
    if (limit) {
      options.take = parseInt(limit);
    }
    if (offset) {
      options.skip = parseInt(offset);
    }

    return prisma.user.findMany(options);
  }

  // Récupérer un utilisateur par id, avec vérification des droits
  async findOne(id: string, user: UserWithRole) { // <--- On utilise le nouveau type
    const targetUser = await prisma.user.findUnique({ 
      where: { id },
      include: { role: true }
    });

    if (!targetUser) throw new NotFoundException('Utilisateur non trouvé');

    if (user.role.name === 'DIRECTEUR_GENERAL') {
      return targetUser;
    }
    if (user.role.name === 'COUNTRY_MANAGER' && targetUser.country === user.country) {
      return targetUser;
    }
    if (user.role.name === 'SALES_OFFICER' && targetUser.id === user.id) {
      return targetUser;
    }

    throw new NotFoundException('Utilisateur non trouvé ou accès non autorisé');
  }

  async getStats(userId: string, user: UserWithRole) { // <--- On utilise le nouveau type
    const targetUser = await this.findOne(userId, user);

    const [
      prospectsCreated,
      prospectsAssigned,
      formationsCreated,
      simulateursCreated,
      commentsCreated,
      interactionsCreated,
    ] = await prisma.$transaction([
      prisma.prospect.count({ where: { createdById: userId, genericStatus: 'ACTIVE' } }),
      prisma.prospect.count({ where: { assignedToId: userId, genericStatus: 'ACTIVE' } }),
      prisma.formation.count({ where: { createdById: userId, status: 'ACTIVE' } }),
      prisma.simulateur.count({ where: { createdById: userId, status: 'ACTIVE' } }),
      prisma.comment.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.interaction.count({ where: { userId, status: 'ACTIVE' } }),
    ]);

    return {
      prospectsCreated,
      prospectsAssigned,
      formationsCreated,
      simulateursCreated,
      commentsCreated,
      interactionsCreated,
    };
  }
}