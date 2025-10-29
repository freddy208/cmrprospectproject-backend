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
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(UserRole.DIRECTEUR_GENERAL, UserRole.COUNTRY_MANAGER)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.DIRECTEUR_GENERAL, UserRole.COUNTRY_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.DIRECTEUR_GENERAL)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get()
  @Roles(UserRole.DIRECTEUR_GENERAL, UserRole.COUNTRY_MANAGER)
  findAll(@Query() filter: FilterUserDto) {
    return this.usersService.findAll(filter);
  }

  @Get(':id')
  @Roles(UserRole.DIRECTEUR_GENERAL, UserRole.COUNTRY_MANAGER)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
