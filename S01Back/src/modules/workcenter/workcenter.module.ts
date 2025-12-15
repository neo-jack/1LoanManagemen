import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkCenterCategory } from '@/entities/work-center-category.entity';
import { SystemModule } from '@/entities/system-module.entity';
import { User } from '@/entities/user.entity';
import { WorkcenterService } from './workcenter.service';
import { WorkcenterController } from './workcenter.controller';

/**
 * 工作中心模块
 * 提供 /api/workcenter 相关接口，与 Java 端 WorkCenterController 一致
 */
@Module({
  imports: [TypeOrmModule.forFeature([WorkCenterCategory, SystemModule, User])],
  providers: [WorkcenterService],
  controllers: [WorkcenterController],
  exports: [WorkcenterService],
})
export class WorkcenterModule {}
