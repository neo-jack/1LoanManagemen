import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepaymentService } from './repayment.service';
import { RepaymentController } from './repayment.controller';
import { RepaymentPlan } from '../../entities/repayment-plan.entity';
import { RepaymentSchedule } from '../../entities/repayment-schedule.entity';
import { LoanCollection } from '../../entities/loan-collection.entity';
import { LoanApplication } from '../../entities/loan-application.entity';
import { User } from '../../entities/user.entity';

/**
 * 还款与催收模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RepaymentPlan,
      RepaymentSchedule,
      LoanCollection,
      LoanApplication,
      User,
    ]),
  ],
  controllers: [RepaymentController],
  providers: [RepaymentService],
  exports: [RepaymentService],
})
export class RepaymentModule {}
