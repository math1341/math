import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles('ADMIN')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
  ) {
    return this.auditService.findAll({ page, limit, action });
  }
}
