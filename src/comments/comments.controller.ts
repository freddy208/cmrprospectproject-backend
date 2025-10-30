/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FilterCommentDto } from './dto/filter-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // <--- Le bon guard d'auth
import { PermissionsGuard } from '../common/guards/permissions.guard'; // <--- Notre nouveau guard
import { Permissions } from '../common/decorators/permissions.decorator'; // <--- Notre nouveau décorateur
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as types from 'src/user/types'; // <--- Notre type propre

@UseGuards(JwtAuthGuard, PermissionsGuard) // <--- Gardes mis à jour
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Permissions('comments:create') // <--- Permission requise
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: types.UserWithRole) {
    return this.commentsService.create(user, dto);
  }

  @Patch(':id')
  @Permissions('comments:update') // <--- Permission requise
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.commentsService.update(user, id, dto);
  }

  @Delete(':id')
  @Permissions('comments:delete') // <--- Permission requise
  remove(@Param('id') id: string, @CurrentUser() user: types.UserWithRole) {
    return this.commentsService.remove(user, id);
  }

  @Get()
  @Permissions('comments:read') // <--- Permission requise
  findAll(
    @Query() filterDto: FilterCommentDto,
    @CurrentUser() user: types.UserWithRole,
  ) {
    // On passe l'utilisateur au service pour le filtrage
    return this.commentsService.findAll(filterDto, user);
  }

  @Get('count/prospect/:prospectId')
  @Permissions('comments:read') // <--- Permission requise
  countByProspect(
    @Param('prospectId') prospectId: string,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.commentsService.countByProspect(prospectId, user);
  }

  @Get('count/user/:userId')
  @Permissions('comments:read') // <--- Permission requise
  countByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: types.UserWithRole,
  ) {
    return this.commentsService.countByUser(userId, user);
  }
}
