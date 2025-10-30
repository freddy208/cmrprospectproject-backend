/* eslint-disable no-unused-vars */
// src/administration/permissions.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard'; // NOUVEAU GUARD
import { Permissions } from '../common/decorators/permissions.decorator'; // NOUVEAU DÉCORATEUR

@Controller('administration/permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard) // On utilise le nouveau guard
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions('permissions:read') // On vérifie la permission
  findAll() {
    return this.permissionsService.findAll();
  }
}
