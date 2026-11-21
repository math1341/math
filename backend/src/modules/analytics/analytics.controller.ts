import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('admin')
  @Roles('ADMIN')
  getAdminStats() {
    return this.analyticsService.getAdminStats();
  }

  @Get('teacher')
  @Roles('ADMIN', 'TEACHER')
  getTeacherStats(@CurrentUser('id') teacherId: string) {
    return this.analyticsService.getTeacherStats(teacherId);
  }

  @Get('student/history')
  @Roles('STUDENT')
  getStudentHistory(@CurrentUser('id') studentId: string) {
    return this.analyticsService.getStudentHistory(studentId);
  }

  @Get('tests/:testId')
  @Roles('ADMIN', 'TEACHER')
  getTestDetailedStats(@Param('testId') testId: string) {
    return this.analyticsService.getTestDetailedStats(testId);
  }

  @Get('tests/:testId/export-excel')
  @Roles('ADMIN', 'TEACHER')
  async exportExcel(@Param('testId') testId: string, @Res() res: Response) {
    const buffer = await this.analyticsService.exportTestToExcel(testId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=protest-results-${testId}.xlsx`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
