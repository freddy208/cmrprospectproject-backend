/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
// src/administration/permissions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.permission.findMany({
      orderBy: {
        name: 'asc', // On trie par le nom de la permission, qui existe bien.
      },
    });
  }
}