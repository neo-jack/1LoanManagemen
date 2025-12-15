import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 任务类型枚举
 */
export type TaskType = 'audit' | 'cc';

/**
 * 任务状态枚举
 */
export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

/**
 * 流程任务实体类(代办/已办)
 */
@Entity('flow_tasks')
export class FlowTask {
  /**
   * 任务ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 流程实例ID
   */
  @Column({ name: 'instance_id', type: 'int' })
  instanceId: number;

  /**
   * 节点ID
   */
  @Column({ name: 'node_id', type: 'int' })
  nodeId: number;

  /**
   * 任务类型:审核/抄送
   */
  @Column({ name: 'task_type', type: 'enum', enum: ['audit', 'cc'], default: 'audit' })
  taskType: TaskType;

  /**
   * 处理人ID
   */
  @Column({ name: 'assignee_id', type: 'int' })
  assigneeId: number;

  /**
   * 状态
   */
  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' })
  status: TaskStatus;

  /**
   * 审批意见
   */
  @Column({ type: 'text', nullable: true })
  comment: string;

  /**
   * 处理时间
   */
  @Column({ name: 'handle_time', type: 'datetime', nullable: true })
  handleTime: Date;

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
