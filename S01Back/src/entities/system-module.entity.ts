import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 系统模块实体类
 * 对应数据库表 system_modules，字段与 Java 端 SystemModule 实体一致
 */
@Entity('system_modules')
export class SystemModule {
  /**
   * 模块ID
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /**
   * 模块代码
   */
  @Column({ name: 'module_code', type: 'varchar', length: 50 })
  moduleCode: string;

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
   * 状态：1-启用，0-禁用
   */
  @Column({ name: 'status', type: 'int', default: 1 })
  status: number;

  /**
   * 分类名称
   */
  @Column({ name: 'category_name', type: 'varchar', length: 100, nullable: true })
  categoryName: string;

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
