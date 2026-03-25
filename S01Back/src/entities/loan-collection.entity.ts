import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 催收方式枚举
 */
export type CollectionMethod = 'phone' | 'sms' | 'email' | 'visit' | 'letter';

/**
 * 催收结果枚举
 */
export type CollectionResult = 'promised' | 'refused' | 'unreachable' | 'paid' | 'other';

/**
 * 逾期催收记录实体类
 */
@Entity('loan_collections')
export class LoanCollection {
  /**
   * 催收ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 关联贷款申请ID
   */
  @Column({ name: 'application_id', type: 'int' })
  applicationId: number;

  /**
   * 关联还款明细ID
   */
  @Column({ name: 'schedule_id', type: 'int', nullable: true })
  scheduleId: number;

  /**
   * 学生用户ID
   */
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  /**
   * 催收人ID(审核员)
   */
  @Column({ name: 'collector_id', type: 'int' })
  collectorId: number;

  /**
   * 催收方式
   */
  @Column({ name: 'method', type: 'enum', enum: ['phone', 'sms', 'email', 'visit', 'letter'], default: 'phone' })
  method: CollectionMethod;

  /**
   * 催收内容
   */
  @Column({ type: 'text' })
  content: string;

  /**
   * 催收结果
   */
  @Column({ type: 'enum', enum: ['promised', 'refused', 'unreachable', 'paid', 'other'], default: 'other' })
  result: CollectionResult;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

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
