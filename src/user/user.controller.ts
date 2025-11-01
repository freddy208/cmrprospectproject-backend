/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request, // <--- Important pour récupérer l'utilisateur
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // <--- Utiliser le bon guard
import { PermissionsGuard } from '../common/guards/permissions.guard'; // <--- Nouveau guard
import { Permissions } from '../common/decorators/permissions.decorator'; // <--- Nouveau décorateur

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard) // <--- Gardes mis à jour
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Permissions('users:create') // <--- Permission requise
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @Permissions('users:update') // <--- Permission requise
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('users:delete') // <--- Permission requise
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get()
  @Permissions('users:read') // <--- Permission requise
  findAll(@Query() filter: FilterUserDto, @Request() req) { // <--- On récupère la requête
    return this.usersService.findAll(filter, req.user); // <--- On passe l'utilisateur au service
  }

  @Get('me') // <--- NOUVELLE ROUTE UTILE
  @Permissions('users:read:own') // <--- Permission pour voir son propre profil
  getMyProfile(@Request() req) {
    return this.usersService.findOne(req.user.id, req.user);
  }

  @Get(':id')
  @Permissions('users:read') // <--- Permission requise
  findOne(@Param('id') id: string, @Request() req) { // <--- On récupère la requête
    return this.usersService.findOne(id, req.user); // <--- On passe l'utilisateur au service
  }

  @Get(':id/stats')
  @Permissions('users:read') // <--- Permission requise (peut être affinée plus tard)
  getUserStats(@Param('id') id: string, @Request() req) {
    return this.usersService.getStats(id, req.user);
  }
}