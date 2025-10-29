/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SimulateurService } from './simulateur.service';
import { CreateSimulateurDto } from './dto/create-simulateur.dto';
import { UpdateSimulateurDto } from './dto/update-simulateur.dto';
import { FilterSimulateurDto } from './dto/filter-simulateur.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as client from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('simulateurs')
export class SimulateurController {
  constructor(private readonly simulateurService: SimulateurService) {}

  // Create (DG + Country Manager)
  @Post()
  @Roles(client.UserRole.DIRECTEUR_GENERAL, client.UserRole.COUNTRY_MANAGER)
  create(@Body() dto: CreateSimulateurDto, @CurrentUser() user: client.User) {
    return this.simulateurService.create(dto, user);
  }

  // List / filter (DG voit tout, CM limité via service)
  @Get()
  @Roles(
    client.UserRole.DIRECTEUR_GENERAL,
    client.UserRole.COUNTRY_MANAGER,
    client.UserRole.SALES_OFFICER,
  )
  findAll(@Query() filter: FilterSimulateurDto, @CurrentUser() user: client.User) {
    return this.simulateurService.findAll(filter, user);
  }

  // Get one
  @Get(':id')
  @Roles(
    client.UserRole.DIRECTEUR_GENERAL,
    client.UserRole.COUNTRY_MANAGER,
    client.UserRole.SALES_OFFICER,
  )
  findOne(@Param('id') id: string, @CurrentUser() user: client.User) {
    return this.simulateurService.findOne(id, user);
  }

  // Update
  @Patch(':id')
  @Roles(client.UserRole.DIRECTEUR_GENERAL, client.UserRole.COUNTRY_MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSimulateurDto,
    @CurrentUser() user: client.User,
  ) {
    return this.simulateurService.update(id, dto, user);
  }

  // Delete (soft)
  @Delete(':id')
  @Roles(client.UserRole.DIRECTEUR_GENERAL, client.UserRole.COUNTRY_MANAGER)
  remove(@Param('id') id: string, @CurrentUser() user: client.User) {
    return this.simulateurService.remove(id, user);
  }

  // Stats endpoints
  // Global (DG)
  @Get('stats/by-country')
  @Roles(client.UserRole.DIRECTEUR_GENERAL)
  countByCountry() {
    return this.simulateurService.countByCountry();
  }

  @Get('stats/by-manager')
  @Roles(client.UserRole.DIRECTEUR_GENERAL)
  countByManager() {
    return this.simulateurService.countByManager();
  }

  @Get('stats/total')
  @Roles(client.UserRole.DIRECTEUR_GENERAL)
  totalCount() {
    return this.simulateurService.totalCount();
  }

  // Prospects per simulateur (global DG)
  @Get('stats/prospects')
  @Roles(client.UserRole.DIRECTEUR_GENERAL)
  countProspectsBySimulateur() {
    return this.simulateurService.countProspectsBySimulateur();
  }

  // Prospects per simulateur filtered by country (DG + CM)
  @Get('stats/prospects/:country')
  @Roles(client.UserRole.DIRECTEUR_GENERAL, client.UserRole.COUNTRY_MANAGER)
  countProspectsBySimulateurAndCountry(@Param('country') country: string) {
    return this.simulateurService.countProspectsBySimulateurAndCountry(country);
  }
}
