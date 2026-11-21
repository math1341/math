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
import { TopicsService } from './topics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('topics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @Get('tree')
  getTree(@Query('includeArchived') includeArchived?: string) {
    return this.topicsService.getTree(includeArchived === 'true');
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('parentId') parentId?: string,
    @Query('isArchived') isArchived?: string,
  ) {
    const archivedBool = isArchived !== undefined ? isArchived === 'true' : undefined;
    return this.topicsService.findAll({ search, parentId, isArchived: archivedBool });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'TEACHER')
  create(
    @Body() body: { name: string; description?: string; parentId?: string; orderIndex?: number },
  ) {
    return this.topicsService.create(body);
  }

  @Put(':id')
  @Roles('ADMIN', 'TEACHER')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; parentId?: string; orderIndex?: number },
  ) {
    return this.topicsService.update(id, body);
  }

  @Patch(':id/archive')
  @Roles('ADMIN', 'TEACHER')
  toggleArchive(@Param('id') id: string) {
    return this.topicsService.toggleArchive(id);
  }

  @Patch('reorder')
  @Roles('ADMIN', 'TEACHER')
  reorder(@Body() body: { items: { id: string; orderIndex: number }[] }) {
    return this.topicsService.reorder(body.items);
  }
}
