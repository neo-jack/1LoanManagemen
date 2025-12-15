import { Module } from '@nestjs/common';
import { WorkCenterService } from './work-center.service';
import { WorkCenterController } from './work-center.controller';

@Module({
  providers: [WorkCenterService],
  controllers: [WorkCenterController],
  exports: [WorkCenterService],
})
export class WorkCenterModule {}
