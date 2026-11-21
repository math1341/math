import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  findAll(
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll({ role, search, page, limit });
  }

  @Get('teachers')
  @Roles('ADMIN', 'TEACHER')
  getTeachers() {
    return this.usersService.getTeachers();
  }

  @Get('students')
  @Roles('ADMIN', 'TEACHER')
  getStudents() {
    return this.usersService.getStudents();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/toggle-block')
  @Roles('ADMIN')
  toggleBlock(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.usersService.toggleBlock(id, adminId);
  }
}
