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

import { AuthGuard } from '@nestjs/passport';
import { InteractionsService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { FilterInteractionDto } from './dto/filter-interaction.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as client from '@prisma/client';

@Controller('interactions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  create(@Body() dto: CreateInteractionDto, @CurrentUser() user: client.User) {
    return this.interactionsService.create(user, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInteractionDto, @CurrentUser() user: client.User) {
    return this.interactionsService.update(user, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: client.User) {
    return this.interactionsService.remove(user, id);
  }

  @Get()
  findAll(@Query() filterDto: FilterInteractionDto) {
    return this.interactionsService.findAll(filterDto);
  }

  @Get('count/prospect/:prospectId')
  countByProspect(@Param('prospectId') prospectId: string) {
    return this.interactionsService.countByProspect(prospectId);
  }

  @Get('count/user/:userId')
  countByUser(@Param('userId') userId: string) {
    return this.interactionsService.countByUser(userId);
  }
}
