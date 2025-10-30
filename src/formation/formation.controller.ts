/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
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
import { FormationService } from './formation.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { FilterFormationDto } from './dto/filter-formation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // <--- Le bon guard d'auth
import { PermissionsGuard } from '../common/guards/permissions.guard'; // <--- Notre nouveau guard
import { Permissions } from '../common/decorators/permissions.decorator'; // <--- Notre nouveau décorateur
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as types from 'src/user/types'; // <--- Notre type propre

@UseGuards(JwtAuthGuard, PermissionsGuard) // <--- Gardes mis à jour
@Controller('formations')
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  @Post()
  @Permissions('formations:create') // <--- Permission requise
  create(@Body() dto: CreateFormationDto, @CurrentUser() user: types.UserWithRole) {
    return this.formationService.create(dto, user);
  }

  @Get()
  @Permissions('formations:read') // <--- Permission requise
  findAll(
    @Query() filter: FilterFormationDto,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.formationService.findAll(filter, user);
  }

  @Get(':id')
  @Permissions('formations:read') // <--- Permission requise
  findOne(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.formationService.findOne(id, user);
  }

  @Patch(':id')
  @Permissions('formations:update') // <--- Permission requise
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFormationDto,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.formationService.update(id, dto, user);
  }

  @Delete(':id')
  @Permissions('formations:delete') // <--- Permission requise
  remove(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.formationService.remove(id, user);
  }

  // --- Stats endpoints ---
  // Ces endpoints sont des opérations de lecture, donc la permission 'formations:read' est appropriée.
  @Get('stats/by-country')
  @Permissions('formations:read')
  countByCountry() {
    return this.formationService.countByCountry();
  }

  @Get('stats/by-manager')
  @Permissions('formations:read')
  countByManager() {
    return this.formationService.countByManager();
  }

  @Get('stats/total')
  @Permissions('formations:read')
  totalCount() {
    return this.formationService.totalCount();
  }

  @Get('stats/prospects')
  @Permissions('formations:read')
  countProspectsByFormation() {
    return this.formationService.countProspectsByFormation();
  }

  @Get('stats/prospects/:country')
  @Permissions('formations:read') // <--- Permission requise
  countProspectsByFormationAndCountry(@Param('country') country: string) {
    return this.formationService.countProspectsByFormationAndCountry(country);
  }
}
