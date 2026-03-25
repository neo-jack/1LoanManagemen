import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 还款明细状态枚举
 */
export type ScheduleStatus = 'pending' | 'paid' | 'overdue' | 'partial';

/**
 * 还款明细实体类（每期还款记录）
 */
@Entity('repayment_schedules')
export class RepaymentSchedule {
  /**
   * 明细ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 还款计划ID
   */
  @Column({ name: 'plan_id', type: 'int' })
  planId: number;

  /**
   * 期数（第几期）
   */
  @Column({ name: 'period_number', type: 'int' })
  periodNumber: number;

  /**
   * 到期日
   */
  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  /**
   * 应还本金
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  principal: number;

  /**
   * 应还利息
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  interest: number;

  /**
   * 应还总额
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  /**
   * 实际还款金额
   */
  @Column({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  /**
   * 实际还款日期
   */
  @Column({ name: 'paid_date', type: 'datetime', nullable: true })
  paidDate: Date;

  /**
   * 还款凭证/发票附件（JSON存储文件信息数组）
   */
  @Column({ type: 'json', nullable: true })
  attachments: Array<{ uid: string; name: string; fileName: string; url: string; type?: string }>;

  /**
   * 状态
   */
  @Column({ type: 'enum', enum: ['pending', 'paid', 'overdue', 'partial'], default: 'pending' })
  status: ScheduleStatus;

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
