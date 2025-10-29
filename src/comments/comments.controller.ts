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
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as client from '@prisma/client';
import { FilterCommentDto } from './dto/filter-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: client.User) {
    return this.commentsService.create(user, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: client.User,
  ) {
    return this.commentsService.update(user, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: client.User) {
    return this.commentsService.remove(user, id);
  }

  @Get()
  findAll(@Query() filterDto: FilterCommentDto) {
    return this.commentsService.findAll(filterDto);
  }

  @Get('count/prospect/:prospectId')
  countByProspect(@Param('prospectId') prospectId: string) {
    return this.commentsService.countByProspect(prospectId);
  }

  @Get('count/user/:userId')
  countByUser(@Param('userId') userId: string) {
    return this.commentsService.countByUser(userId);
  }
}
