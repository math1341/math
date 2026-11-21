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
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.testsService.findAll({ search, page, limit }, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.testsService.findOne(id, user);
  }

  @Post()
  @Roles('ADMIN', 'TEACHER')
  create(@Body() body: any, @CurrentUser('id') teacherId: string) {
    return this.testsService.create(body, teacherId);
  }

  @Put(':id')
  @Roles('ADMIN', 'TEACHER')
  update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.testsService.update(id, body, user);
  }

  @Patch(':id/archive')
  @Roles('ADMIN', 'TEACHER')
  toggleArchive(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.testsService.toggleArchive(id, user);
  }
}
