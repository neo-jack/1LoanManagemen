import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 节点类型枚举
 */
export type NodeType = 'start' | 'audit' | 'end';

/**
 * 审核人类型枚举
 */
export type AuditorType = 'user' | 'role';

/**
 * 流程节点实体类
 */
@Entity('flow_nodes')
export class FlowNode {
  /**
   * 节点ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 流程配置ID
   */
  @Column({ name: 'flow_id', type: 'int' })
  flowId: number;

  /**
   * 节点名称
   */
  @Column({ name: 'node_name', type: 'varchar', length: 100 })
  nodeName: string;

  /**
   * 节点类型
   */
  @Column({ name: 'node_type', type: 'enum', enum: ['start', 'audit', 'end'] })
  nodeType: NodeType;

  /**
   * 审核人类型
   */
  @Column({ name: 'auditor_type', type: 'enum', enum: ['user', 'role'], default: 'role' })
  auditorType: AuditorType;

  /**
   * 审核人ID(用户ID或角色)
   */
  @Column({ name: 'auditor_id', type: 'int', nullable: true })
  auditorId: number;

  /**
   * 审核人角色
   */
  @Column({ name: 'auditor_role', type: 'varchar', length: 50, nullable: true })
  auditorRole: string;

  /**
   * 节点顺序
   */
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  /**
   * 下一节点ID
   */
  @Column({ name: 'next_node_id', type: 'int', nullable: true })
  nextNodeId: number;

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
