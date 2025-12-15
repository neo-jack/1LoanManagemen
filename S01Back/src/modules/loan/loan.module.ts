import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { LoanApplication } from '../../entities/loan-application.entity';
import { LoanFormConfig } from '../../entities/loan-form-config.entity';
import { LoanFormField } from '../../entities/loan-form-field.entity';
import { FlowConfig } from '../../entities/flow-config.entity';
import { FlowNode } from '../../entities/flow-node.entity';
import { FlowInstance } from '../../entities/flow-instance.entity';
import { FlowTask } from '../../entities/flow-task.entity';
import { User } from '../../entities/user.entity';

/**
 * 贷款模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoanApplication,
      LoanFormConfig,
      LoanFormField,
      FlowConfig,
      FlowNode,
      FlowInstance,
      FlowTask,
      User,
    ]),
  ],
  controllers: [LoanController],
  providers: [LoanService],
  exports: [LoanService],
})
export class LoanModule {}
