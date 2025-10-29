/* eslint-disable no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '@prisma/client';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FilterCommentDto } from './dto/filter-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        prospectId: dto.prospectId,
        userId: user.id,
      },
    });
  }

  async update(user: User, id: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    // on applique la logique: doit être lié au prospect
    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
    });
  }

  async remove(user: User, id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.comment.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async findAll(filterDto: FilterCommentDto) {
    const where: any = { status: 'ACTIVE' };
    if (filterDto.prospectId) where.prospectId = filterDto.prospectId;
    if (filterDto.userId) where.userId = filterDto.userId;
    if (filterDto.content)
      where.content = { contains: filterDto.content, mode: 'insensitive' };
    return this.prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByProspect(prospectId: string) {
    return this.prisma.comment.count({
      where: { prospectId, status: 'ACTIVE' },
    });
  }

  async countByUser(userId: string) {
    return this.prisma.comment.count({ where: { userId, status: 'ACTIVE' } });
  }
}
