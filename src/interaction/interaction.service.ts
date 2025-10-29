/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { FilterInteractionDto } from './dto/filter-interaction.dto';
import { User } from '@prisma/client';

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, dto: CreateInteractionDto) {
    return this.prisma.interaction.create({
      data: {
        type: dto.type,
        channel: dto.channel,
        notes: dto.notes,
        duration: dto.duration,
        userId: user.id,
        prospectId: dto.prospectId,
      },
    });
  }

  async update(user: User, id: string, dto: UpdateInteractionDto) {
    const interaction = await this.prisma.interaction.findUnique({
      where: { id },
    });
    if (!interaction) throw new NotFoundException('Interaction non trouvée');
    return this.prisma.interaction.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: User, id: string) {
    const interaction = await this.prisma.interaction.findUnique({ where: { id } });
    if (!interaction) throw new NotFoundException('Interaction non trouvée');
    return this.prisma.interaction.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async findAll(filterDto: FilterInteractionDto) {
    const where: any = { status: 'ACTIVE' };
    if (filterDto.prospectId) where.prospectId = filterDto.prospectId;
    if (filterDto.userId) where.userId = filterDto.userId;
    if (filterDto.channel) where.channel = filterDto.channel;
    if (filterDto.type) where.type = { contains: filterDto.type, mode: 'insensitive' };
    if (filterDto.notes) where.notes = { contains: filterDto.notes, mode: 'insensitive' };

    return this.prisma.interaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  async countByProspect(prospectId: string) {
    return this.prisma.interaction.count({
      where: { prospectId, status: 'ACTIVE' },
    });
  }

  async countByUser(userId: string) {
    return this.prisma.interaction.count({
      where: { userId, status: 'ACTIVE' },
    });
  }
}
