import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 表单配置实体类
 */
@Entity('loan_form_configs')
export class LoanFormConfig {
  /**
   * 配置ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 配置名称
   */
  @Column({ name: 'config_name', type: 'varchar', length: 100 })
  configName: string;

  /**
   * 贷款类型
   */
  @Column({ name: 'loan_type', type: 'varchar', length: 50, unique: true })
  loanType: string;

  /**
   * 描述
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * 是否启用
   */
  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  /**
   * 创建人ID
   */
  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number;

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
