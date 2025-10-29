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
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // Créer un utilisateur
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

  // Mettre à jour un utilisateur
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

  // Soft delete d'un utilisateur
  async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    return prisma.user.update({
      where: { id },
      data: { status: 'DELETED', isActive: false },
    });
  }

  // Liste des utilisateurs avec filtres et recherche
  async findAll(filter: FilterUserDto) {
    const { search, role, country, status } = filter;

    return prisma.user.findMany({
      where: {
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
          role ? { role } : {},
          country ? { country } : {},
          status ? { status } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Récupérer un utilisateur par id
  async findOne(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }
  async getStats(userId: string) {
    // Vérifier que l'utilisateur existe
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new NotFoundException('Utilisateur non trouvé');

    // $transaction pour exécuter toutes les requêtes en une seule fois
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
