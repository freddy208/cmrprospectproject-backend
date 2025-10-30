// src/administration/administration.module.ts
import { Module } from '@nestjs/common';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    AdministrationController,
    PermissionsController, // NOUVEAU
    RolesController, // NOUVEAU
  ],
  providers: [
    AdministrationService,
    PrismaService,
    PermissionsService, // NOUVEAU
    RolesService, // NOUVEAU
  ],
})
export class AdministrationModule {}
