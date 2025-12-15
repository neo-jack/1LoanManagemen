import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 流程实例状态枚举
 */
export type FlowInstanceStatus = 'running' | 'completed' | 'rejected' | 'cancelled';

/**
 * 流程实例实体类
 */
@Entity('flow_instances')
export class FlowInstance {
  /**
   * 流程实例ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 流程配置ID
   */
  @Column({ name: 'flow_id', type: 'int' })
  flowId: number;

  /**
   * 业务类型
   */
  @Column({ name: 'business_type', type: 'varchar', length: 50 })
  businessType: string;

  /**
   * 业务ID(如申请ID)
   */
  @Column({ name: 'business_id', type: 'int' })
  businessId: number;

  /**
   * 当前节点ID
   */
  @Column({ name: 'current_node_id', type: 'int', nullable: true })
  currentNodeId: number;

  /**
   * 状态
   */
  @Column({ type: 'enum', enum: ['running', 'completed', 'rejected', 'cancelled'], default: 'running' })
  status: FlowInstanceStatus;

  /**
   * 发起人ID
   */
  @Column({ name: 'initiator_id', type: 'int' })
  initiatorId: number;

  /**
   * 开始时间
   */
  @Column({ name: 'start_time', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startTime: Date;

  /**
   * 结束时间
   */
  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

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
