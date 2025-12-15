import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 工作中心分类实体类
 * 对应数据库表 work_center_categories
 */
@Entity('work_center_categories')
export class WorkCenterCategory {
  /**
   * 分类ID
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /**
   * 分类ID（业务ID）
   */
  @Column({ name: 'category_id', type: 'varchar', length: 50 })
  categoryId: string;

  /**
   * 分类名称
   */
  @Column({ name: 'category_name', type: 'varchar', length: 100 })
  categoryName: string;

  /**
   * 分类图标
   */
  @Column({ name: 'category_icon', type: 'varchar', length: 100, nullable: true })
  categoryIcon: string;

  /**
   * 排序
   */
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  /**
   * 状态：1-启用，0-禁用
   */
  @Column({ name: 'status', type: 'int', default: 1 })
  status: number;

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
