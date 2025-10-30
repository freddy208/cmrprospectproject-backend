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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // <--- Le bon guard d'auth
import { PermissionsGuard } from '../common/guards/permissions.guard'; // <--- Notre nouveau guard
import { Permissions } from '../common/decorators/permissions.decorator'; // <--- Notre nouveau décorateur
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as types from 'src/user/types'; // <--- Notre type propre

@UseGuards(JwtAuthGuard, PermissionsGuard) // <--- Gardes mis à jour
@Controller('simulateurs')
export class SimulateurController {
  constructor(private readonly simulateurService: SimulateurService) {}

  @Post()
  @Permissions('simulateurs:create') // <--- Permission requise
  create(@Body() dto: CreateSimulateurDto, @CurrentUser() user: types.UserWithRole) {
    return this.simulateurService.create(dto, user);
  }

  @Get()
  @Permissions('simulateurs:read') // <--- Permission requise
  findAll(@Query() filter: FilterSimulateurDto, @CurrentUser() user: types.UserWithRole) {
    return this.simulateurService.findAll(filter, user);
  }

  @Get(':id')
  @Permissions('simulateurs:read') // <--- Permission requise
  findOne(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.simulateurService.findOne(id, user);
  }

  @Patch(':id')
  @Permissions('simulateurs:update') // <--- Permission requise
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSimulateurDto,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.simulateurService.update(id, dto, user);
  }

  @Delete(':id')
  @Permissions('simulateurs:delete') // <--- Permission requise
  remove(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.simulateurService.remove(id, user);
  }

  // --- Stats endpoints ---
  @Get('stats/by-country')
  @Permissions('simulateurs:read') // <--- Permission requise
  countByCountry() {
    return this.simulateurService.countByCountry();
  }

  @Get('stats/by-manager')
  @Permissions('simulateurs:read') // <--- Permission requise
  countByManager() {
    return this.simulateurService.countByManager();
  }

  @Get('stats/total')
  @Permissions('simulateurs:read') // <--- Permission requise
  totalCount() {
    return this.simulateurService.totalCount();
  }

  @Get('stats/prospects')
  @Permissions('simulateurs:read') // <--- Permission requise
  countProspectsBySimulateur() {
    return this.simulateurService.countProspectsBySimulateur();
  }

  @Get('stats/prospects/:country')
  @Permissions('simulateurs:read') // <--- Permission requise
  countProspectsBySimulateurAndCountry(@Param('country') country: string) {
    return this.simulateurService.countProspectsBySimulateurAndCountry(country);
  }
}