import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TestingService } from './testing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('testing')
@UseGuards(JwtAuthGuard)
export class TestingController {
  constructor(private testingService: TestingService) {}

  @Post(':testId/start')
  startOrResume(
    @Param('testId') testId: string,
    @CurrentUser('id') studentId: string,
  ) {
    return this.testingService.startOrResumeAttempt(testId, studentId);
  }

  @Post('attempts/:attemptId/save-answer')
  saveAnswer(
    @Param('attemptId') attemptId: string,
    @CurrentUser('id') studentId: string,
    @Body() body: {
      questionId: string;
      selectedOptionIds?: string[];
      numericAnswer?: number;
      textAnswer?: string;
    },
  ) {
    return this.testingService.saveAnswer(attemptId, studentId, body);
  }

  @Post('attempts/:attemptId/finish')
  finishAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser('id') studentId: string,
  ) {
    return this.testingService.finishAttempt(attemptId, studentId);
  }

  @Get('attempts/:attemptId/results')
  getResults(
    @Param('attemptId') attemptId: string,
    @CurrentUser('id') studentId: string,
  ) {
    return this.testingService.getAttemptResult(attemptId, studentId);
  }
}
