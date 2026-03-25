import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 还款计划状态枚举
 */
export type RepaymentPlanStatus = 'active' | 'completed' | 'overdue' | 'cancelled';

/**
 * 还款计划实体类
 */
@Entity('repayment_plans')
export class RepaymentPlan {
  /**
   * 计划ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 关联贷款申请ID
   */
  @Column({ name: 'application_id', type: 'int' })
  applicationId: number;

  /**
   * 学生用户ID
   */
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  /**
   * 贷款总金额
   */
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  /**
   * 年利率(%)
   */
  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, default: 4.5 })
  interestRate: number;

  /**
   * 总期数(月)
   */
  @Column({ name: 'total_periods', type: 'int', default: 12 })
  totalPeriods: number;

  /**
   * 每期还款金额
   */
  @Column({ name: 'period_amount', type: 'decimal', precision: 10, scale: 2 })
  periodAmount: number;

  /**
   * 已还期数
   */
  @Column({ name: 'paid_periods', type: 'int', default: 0 })
  paidPeriods: number;

  /**
   * 已还总额
   */
  @Column({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  /**
   * 还款开始日期
   */
  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  /**
   * 状态
   */
  @Column({ type: 'enum', enum: ['active', 'completed', 'overdue', 'cancelled'], default: 'active' })
  status: RepaymentPlanStatus;

  /**
   * 创建时间
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
