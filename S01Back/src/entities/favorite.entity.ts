import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 用户收藏实体类
 * 对应数据库表 user_favorites，字段与 Java 端 Favorite 实体一致
 */
@Entity('user_favorites')
export class Favorite {
  /**
   * 收藏ID
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /**
   * 用户ID
   */
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  /**
   * 模块ID
   */
  @Column({ name: 'module_id', type: 'varchar', length: 50 })
  moduleId: string;

  /**
   * 模块名称
   */
  @Column({ name: 'module_name', type: 'varchar', length: 100 })
  moduleName: string;

  /**
   * 模块描述
   */
  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description: string;

  /**
   * 图标
   */
  @Column({ name: 'icon', type: 'varchar', length: 100, nullable: true })
  icon: string;

  /**
   * 端口
   */
  @Column({ name: 'port', type: 'int', nullable: true })
  port: number;

  /**
   * 访问URL
   */
  @Column({ name: 'url', type: 'varchar', length: 255, nullable: true })
  url: string;

  /**
   * 排序序号
   */
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  /**
   * 是否收藏
   */
  @Column({ name: 'is_favorite', type: 'int', default: 1 })
  isFavorite: number;

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
