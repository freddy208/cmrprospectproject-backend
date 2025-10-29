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
import * as client from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('formations')
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  @Post()
  create(@Body() dto: CreateFormationDto, @CurrentUser() user: client.User) {
    return this.formationService.create(dto, user);
  }

  @Get()
  findAll(
    @Query() filter: FilterFormationDto,
    @CurrentUser() user: client.User,
  ) {
    return this.formationService.findAll(filter, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: client.User) {
    return this.formationService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFormationDto,
    @CurrentUser() user: client.User,
  ) {
    return this.formationService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: client.User) {
    return this.formationService.remove(id, user);
  }

  // Stats endpoints
  @Get('stats/by-country')
  countByCountry() {
    return this.formationService.countByCountry();
  }

  @Get('stats/by-manager')
  countByManager() {
    return this.formationService.countByManager();
  }

  @Get('stats/total')
  totalCount() {
    return this.formationService.totalCount();
  }

  @Get('stats/prospects')
  countProspectsByFormation() {
    return this.formationService.countProspectsByFormation();
  }
  // 🟦 Endpoint filtré par pays (visible pour Country Manager et Directeur)
  @Get('stats/prospects/:country')
  @Roles(UserRole.DIRECTEUR_GENERAL, UserRole.COUNTRY_MANAGER)
  countProspectsByFormationAndCountry(@Param('country') country: string) {
    return this.formationService.countProspectsByFormationAndCountry(country);
  }
}
