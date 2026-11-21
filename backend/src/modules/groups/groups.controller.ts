import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  @Roles('ADMIN', 'TEACHER')
  create(
    @Body() body: { name: string; description?: string; studentIds?: string[] },
    @CurrentUser('id') teacherId: string,
  ) {
    return this.groupsService.create(body, teacherId);
  }

  @Get()
  findMyGroups(@CurrentUser() user: { id: string; role: string }) {
    return this.groupsService.findMyGroups(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.groupsService.findOne(id, user);
  }

  @Put(':id')
  @Roles('ADMIN', 'TEACHER')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.groupsService.update(id, body, user.id, user.role === 'ADMIN');
  }

  @Post(':id/students/:studentId')
  @Roles('ADMIN', 'TEACHER')
  addStudent(
    @Param('id') groupId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.groupsService.addStudent(groupId, studentId, user.id, user.role === 'ADMIN');
  }

  @Delete(':id/students/:studentId')
  @Roles('ADMIN', 'TEACHER')
  removeStudent(
    @Param('id') groupId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.groupsService.removeStudent(groupId, studentId, user.id, user.role === 'ADMIN');
  }
}
