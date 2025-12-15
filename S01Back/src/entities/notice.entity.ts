import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 通知类型枚举
 */
export type NoticeType = 'system' | 'loan' | 'flow';

/**
 * 目标类型枚举
 */
export type TargetType = 'all' | 'role' | 'user';

/**
 * 通知实体类
 */
@Entity('notices')
export class Notice {
  /**
   * 通知ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 标题
   */
  @Column({ type: 'varchar', length: 200 })
  title: string;

  /**
   * 内容
   */
  @Column({ type: 'text', nullable: true })
  content: string;

  /**
   * 通知类型
   */
  @Column({ name: 'notice_type', type: 'enum', enum: ['system', 'loan', 'flow'], default: 'system' })
  noticeType: NoticeType;

  /**
   * 关联业务类型
   */
  @Column({ name: 'business_type', type: 'varchar', length: 50, nullable: true })
  businessType: string;

  /**
   * 关联业务ID
   */
  @Column({ name: 'business_id', type: 'int', nullable: true })
  businessId: number;

  /**
   * 发送人ID
   */
  @Column({ name: 'sender_id', type: 'int', nullable: true })
  senderId: number;

  /**
   * 目标类型
   */
  @Column({ name: 'target_type', type: 'enum', enum: ['all', 'role', 'user'], default: 'all' })
  targetType: TargetType;

  /**
   * 目标ID列表
   */
  @Column({ name: 'target_ids', type: 'json', nullable: true })
  targetIds: number[];

  /**
   * 是否发布
   */
  @Column({ name: 'is_published', type: 'tinyint', default: 0 })
  isPublished: number;

  /**
   * 发布时间
   */
  @Column({ name: 'publish_time', type: 'datetime', nullable: true })
  publishTime: Date;

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
