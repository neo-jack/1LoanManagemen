import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 流程配置状态枚举
 */
export type FlowConfigStatus = 'draft' | 'pending' | 'active' | 'inactive';

/**
 * 流程配置实体类
 */
@Entity('flow_configs')
export class FlowConfig {
  /**
   * 流程配置ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 流程名称
   */
  @Column({ name: 'flow_name', type: 'varchar', length: 100 })
  flowName: string;

  /**
   * 业务类型(如:loan_application)
   */
  @Column({ name: 'business_type', type: 'varchar', length: 50 })
  businessType: string;

  /**
   * 描述
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * 状态
   */
  @Column({ type: 'enum', enum: ['draft', 'pending', 'active', 'inactive'], default: 'draft' })
  status: FlowConfigStatus;

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
