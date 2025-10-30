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
import { ProspectService } from './prospect.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { FilterProspectDto } from './dto/filter-prospect.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as types from '../user/types';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('prospects')
export class ProspectController {
  constructor(private readonly prospectService: ProspectService) {}

  @Post()
  @Permissions('prospects:create')
  create(
    @Body() dto: CreateProspectDto,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.prospectService.create(dto, user);
  }

  @Get()
  @Permissions('prospects:read')
  findAll(
    @Query() filter: FilterProspectDto,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.prospectService.findAll(filter, user);
  }

  @Get(':id')
  @Permissions('prospects:read')
  findOne(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.prospectService.findOne(id, user);
  }

  @Patch(':id')
  @Permissions('prospects:update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProspectDto,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.prospectService.update(id, dto, user);
  }

  @Delete(':id')
  @Permissions('prospects:delete')
  remove(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.prospectService.remove(id, user);
  }

  // --- Endpoints pour les actions métier ---

  @Patch(':id/assign')
  @Permissions('prospects:update')
  assign(
    @Param('id') id: string,
    @Body('assignedToId') assignedToId: string,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.prospectService.assign(id, assignedToId, user);
  }

  @Patch(':id/convert')
  @Permissions('prospects:update')
  convert(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.prospectService.convert(id, user);
  }

  // --- Endpoints pour les données associées ---

  @Get(':id/interactions')
  @Permissions('interactions:read') // On utilise la permission de lecture des interactions
  getInteractions(
    @Param('id') id: string,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.prospectService.getInteractionsForProspect(id, user);
  }

  @Get(':id/comments')
  @Permissions('comments:read') // On utilise la permission de lecture des commentaires
  getComments(
    @Param('id') id: string,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.prospectService.getCommentsForProspect(id, user);
  }
}
