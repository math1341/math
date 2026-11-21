import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';

@Module({
  providers: [TestingService],
  controllers: [TestingController],
  exports: [TestingService],
})
export class TestingModule {}
