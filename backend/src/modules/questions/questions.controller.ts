import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @Roles('ADMIN', 'TEACHER')
  findAll(
    @Query('topicId') topicId: string,
    @Query('difficulty') difficulty: string,
    @Query('search') search: string,
    @Query('isArchived') isArchived: string,
    @Query('authorId') authorId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const isArchivedBool = isArchived !== undefined ? isArchived === 'true' : false;
    return this.questionsService.findAll(
      { topicId, difficulty, search, isArchived: isArchivedBool, authorId, page, limit },
      user,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.questionsService.findOne(id, user);
  }

  @Post()
  @Roles('ADMIN', 'TEACHER')
  create(@Body() body: any, @CurrentUser('id') authorId: string) {
    return this.questionsService.create(body, authorId);
  }

  @Put(':id')
  @Roles('ADMIN', 'TEACHER')
  update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.questionsService.update(id, body, user);
  }

  @Patch(':id/archive')
  @Roles('ADMIN', 'TEACHER')
  toggleArchive(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.questionsService.toggleArchive(id, user);
  }
}
