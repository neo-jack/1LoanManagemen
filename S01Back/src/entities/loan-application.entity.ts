import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 贷款申请状态枚举
 */
export type LoanStatus = 'draft' | 'pending' | 'auditing' | 'approved' | 'rejected' | 'completed';

/**
 * 贷款申请实体类
 */
@Entity('loan_applications')
export class LoanApplication {
  /**
   * 申请ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 申请编号
   */
  @Column({ name: 'application_no', type: 'varchar', length: 50, unique: true })
  applicationNo: string;

  /**
   * 申请人ID(学生)
   */
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  /**
   * 贷款类型
   */
  @Column({ name: 'loan_type', type: 'varchar', length: 50 })
  loanType: string;

  /**
   * 申请金额
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  /**
   * 贷款用途
   */
  @Column({ type: 'text', nullable: true })
  purpose: string;

  /**
   * 表单数据(动态字段)
   */
  @Column({ name: 'form_data', type: 'json', nullable: true })
  formData: Record<string, any>;

  /**
   * 状态
   */
  @Column({ type: 'enum', enum: ['draft', 'pending', 'auditing', 'approved', 'rejected', 'completed'], default: 'draft' })
  status: LoanStatus;

  /**
   * 当前流程节点ID
   */
  @Column({ name: 'current_node_id', type: 'int', nullable: true })
  currentNodeId: number;

  /**
   * 提交时间
   */
  @Column({ name: 'submit_time', type: 'datetime', nullable: true })
  submitTime: Date;

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
