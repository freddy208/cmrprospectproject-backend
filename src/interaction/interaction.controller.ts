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
  ForbiddenException,
} from '@nestjs/common';
import { InteractionsService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { FilterInteractionDto } from './dto/filter-interaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // <--- Le bon guard d'auth
import { PermissionsGuard } from '../common/guards/permissions.guard'; // <--- Notre nouveau guard
import { Permissions } from '../common/decorators/permissions.decorator'; // <--- Notre nouveau décorateur
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as types from 'src/user/types'; // <--- Notre type propre

@UseGuards(JwtAuthGuard, PermissionsGuard) // <--- Gardes mis à jour
@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  @Permissions('interactions:create') // <--- Permission requise
  create(@Body() dto: CreateInteractionDto, @CurrentUser() user: types.UserWithRole) {
    return this.interactionsService.create(user, dto);
  }

  @Patch(':id')
  @Permissions('interactions:update') // <--- Permission requise
  update(@Param('id') id: string, @Body() dto: UpdateInteractionDto, @CurrentUser() user: types.UserWithRole) {
    return this.interactionsService.update(user, id, dto);
  }

  @Delete(':id')
  @Permissions('interactions:delete') // <--- Permission requise
  remove(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.interactionsService.remove(user, id);
  }

  @Get()
  @Permissions('interactions:read') // <--- Permission requise
  findAll(@Query() filterDto: FilterInteractionDto, @CurrentUser() user: types.UserWithRole) {
    // On passe l'utilisateur au service pour le filtrage
    return this.interactionsService.findAll(filterDto, user);
  }

  @Get('count/prospect/:prospectId')
  @Permissions('interactions:read') // <--- Permission requise
  countByProspect(@Param('prospectId') prospectId: string, @CurrentUser() user: types.UserWithRole) {
    return this.interactionsService.countByProspect(prospectId, user);
  }

  @Get('count/user/:userId')
  @Permissions('interactions:read') // <--- Permission requise
  countByUser(@Param('userId') userId: string, @CurrentUser() user: types.UserWithRole) {
    return this.interactionsService.countByUser(userId, user);
  }
}