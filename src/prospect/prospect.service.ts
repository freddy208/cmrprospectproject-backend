/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { FilterProspectDto } from './dto/filter-prospect.dto';
import { ProspectStatus } from '@prisma/client';
import { UserWithRole } from '../user/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProspectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProspectDto, user: UserWithRole) {
    // Un Sales Officer ne peut assigner un prospect qu'à lui-même
    if (user.role.name === 'SALES_OFFICER' && dto.assignedToId && dto.assignedToId !== user.id) {
      throw new ForbiddenException("Vous ne pouvez pas assigner un prospect à quelqu'un d'autre");
    }

    const prospect = await this.prisma.prospect.create({
      data: {
        ...dto,
        createdById: user.id,
        // Si c'est un SO et qu'il n'essaie pas d'assigner, on s'assigne par défaut
        assignedToId: dto.assignedToId || (user.role.name === 'SALES_OFFICER' ? user.id : null),
      },
      include: { // Inclure les données pour la réponse
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        formation: { select: { id: true, name: true } },
        simulateur: { select: { id: true, name: true } },
      },
    });

    // Si un commentaire initial est fourni, on le crée
    if (dto.initialComment) {
      await this.prisma.comment.create({
        data: {
          content: dto.initialComment,
          prospectId: prospect.id,
          userId: user.id,
        },
      });
    }

    return prospect;
  }

  async findAll(filter: FilterProspectDto, user: UserWithRole) {
    const where: any = { genericStatus: 'ACTIVE' };

    // --- LOGIQUE DE FILTRAGE PAR RÔLE ---
    if (user.role.name === 'SALES_OFFICER') {
      where.assignedToId = user.id;
    } else if (user.role.name === 'COUNTRY_MANAGER') {
      where.country = user.country;
    }
    // Le DG voit tout (pas de filtre)

    // Appliquer les filtres de recherche
    if (filter.search) {
      where.OR = [
        { email: { contains: filter.search, mode: 'insensitive' } },
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { companyName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.country) where.country = filter.country;
    if(filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    if (filter.serviceType) where.serviceType = filter.serviceType;
    if (filter.leadChannel) where.leadChannel = filter.leadChannel;
    if (filter.assignedToId) where.assignedToId = filter.assignedToId;

    return this.prisma.prospect.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        formation: { select: { id: true, name: true, price: true } },
        simulateur: { select: { id: true, name: true, monthlyPrice: true } },
        _count: { select: { comments: true, interactions: true } }, // Utile pour le frontend
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  // nouvelle methodes 
  async findAllEntreprises(filter: FilterProspectDto, user: UserWithRole) {
    const where: any = { type: 'ENTREPRISE', generecStatus: 'ACTIVE' };

    // --- LOGIQUE DE FILTRAGE PAR RÔLE ---
    if (user.role.name === 'SALES_OFFICER') {
      where.assignedToId = user.id;
    } else if (user.role.name === 'COUNTRY_MANAGER') {
      where.country = user.country;
    }
    // Le DG voit tout (pas de filtre)

    // Appliquer les filtres de recherche
    if (filter.search) {
      where.OR = [
        { email: { contains: filter.search, mode: 'insensitive' } },
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { companyName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.country) where.country = filter.country;
    if(filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    if (filter.serviceType) where.serviceType = filter.serviceType;
    if (filter.leadChannel) where.leadChannel = filter.leadChannel;
    if (filter.assignedToId) where.assignedToId = filter.assignedToId;

    return this.prisma.prospect.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        formation: { select: { id: true, name: true, price: true } },
        simulateur: { select: { id: true, name: true, monthlyPrice: true } },
        _count: { select: { comments: true, interactions: true } }, // Utile pour le frontend
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  // nouvelle methodes 
   // nouvelle methodes 
  async findAllAboutis(filter: FilterProspectDto, user: UserWithRole) {
    const where: any = { status: 'CONVERTI', generecStatus: 'ACTIVE' };

    // --- LOGIQUE DE FILTRAGE PAR RÔLE ---
    if (user.role.name === 'SALES_OFFICER') {
      where.assignedToId = user.id;
    } else if (user.role.name === 'COUNTRY_MANAGER') {
      where.country = user.country;
    }
    // Le DG voit tout (pas de filtre)

    // Appliquer les filtres de recherche
    if (filter.search) {
      where.OR = [
        { email: { contains: filter.search, mode: 'insensitive' } },
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { companyName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.country) where.country = filter.country;
    if(filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    if (filter.serviceType) where.serviceType = filter.serviceType;
    if (filter.leadChannel) where.leadChannel = filter.leadChannel;
    if (filter.assignedToId) where.assignedToId = filter.assignedToId;

    return this.prisma.prospect.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        formation: { select: { id: true, name: true, price: true } },
        simulateur: { select: { id: true, name: true, monthlyPrice: true } },
        _count: { select: { comments: true, interactions: true } }, // Utile pour le frontend
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  // nouvelle methodes 

  async findOne(id: string, user: UserWithRole) {
    const prospect = await this.prisma.prospect.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        formation: true,
        simulateur: true,
        _count: { select: { comments: true, interactions: true } }, // Utile pour le frontend
        comments: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
        interactions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    if (!prospect) throw new NotFoundException('Prospect non trouvé');

    // --- VÉRIFICATION DES DROITS ---
    if (user.role.name === 'SALES_OFFICER' && prospect.assignedToId !== user.id) {
      throw new ForbiddenException('Accès non autorisé à ce prospect');
    }
    if (user.role.name === 'COUNTRY_MANAGER' && prospect.country !== user.country) {
      throw new ForbiddenException('Accès non autorisé à ce prospect');
    }

    return prospect;
  }

  async update(id: string, dto: UpdateProspectDto, user: UserWithRole) {
    // On réutilise findOne pour la vérification des droits
    await this.findOne(id, user);

    // Un SO ne peut réassigner que s'il s'assigne à lui-même
    if (user.role.name === 'SALES_OFFICER' && dto.assignedToId && dto.assignedToId !== user.id) {
      throw new ForbiddenException("Vous ne pouvez pas réassigner ce prospect");
    }

    return this.prisma.prospect.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, user: UserWithRole) {
    // On réutilise findOne pour la vérification des droits
    await this.findOne(id, user);

    // Soft delete
    return this.prisma.prospect.update({
      where: { id },
      data: { genericStatus: 'DELETED' },
    });
  }

  // --- Méthodes utilitaires pour les actions métier ---

  async assign(id: string, assignedToId: string, user: UserWithRole) {
    await this.findOne(id, user); // Vérification des droits
    return this.prisma.prospect.update({
      where: { id },
      data: { assignedToId },
    });
  }

  async convert(id: string, user: UserWithRole) {
    await this.findOne(id, user); // Vérification des droits
    return this.prisma.prospect.update({
      where: { id },
      data: { status: ProspectStatus.CONVERTI, convertedAt: new Date() },
    });
  }
  
  // --- Méthodes pour les données associées (appelées par le contrôleur) ---
  
  async getInteractionsForProspect(prospectId: string, user: UserWithRole) {
    await this.findOne(prospectId, user); // Vérifie les droits sur le prospect
    return this.prisma.interaction.findMany({
      where: { prospectId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async getCommentsForProspect(prospectId: string, user: UserWithRole) {
    await this.findOne(prospectId, user); // Vérifie les droits sur le prospect
    return this.prisma.comment.findMany({
      where: { prospectId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}