import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowService } from './flow.service';
import { FlowController } from './flow.controller';
import { FlowConfig } from '../../entities/flow-config.entity';
import { FlowNode } from '../../entities/flow-node.entity';
import { FlowInstance } from '../../entities/flow-instance.entity';
import { FlowTask } from '../../entities/flow-task.entity';
import { LoanApplication } from '../../entities/loan-application.entity';
import { User } from '../../entities/user.entity';

/**
 * 流程模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlowConfig,
      FlowNode,
      FlowInstance,
      FlowTask,
      LoanApplication,
      User,
    ]),
  ],
  controllers: [FlowController],
  providers: [FlowService],
  exports: [FlowService],
})
export class FlowModule {}
