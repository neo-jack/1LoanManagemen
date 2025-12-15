import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 菜单实体类
 */
@Entity('system_menus')
export class Menu {
  /**
   * 菜单ID
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /**
   * 用户ID
   */
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  /**
   * 协同ID
   */
  @Column({ name: 'synergy_id', type: 'bigint', nullable: true })
  synergyId: number;

  /**
   * 菜单编号
   */
  @Column({ name: 'menu_no', type: 'varchar', length: 50 })
  menuNo: string;

  /**
   * 菜单名称
   */
  @Column({ name: 'menu_name', type: 'varchar', length: 100 })
  menuName: string;

  /**
   * 菜单图标
   */
  @Column({ name: 'menu_icon', type: 'varchar', length: 100, nullable: true })
  menuIcon: string;

  /**
   * 菜单URL
   */
  @Column({ name: 'menu_url', type: 'varchar', length: 255, nullable: true })
  menuUrl: string;

  /**
   * 系统菜单
   */
  @Column({ name: 'sys_menu', type: 'varchar', length: 50, nullable: true })
  sysMenu: string;

  /**
   * 父级代码
   */
  @Column({ name: 'parent_code', type: 'varchar', length: 50, nullable: true })
  parentCode: string;

  /**
   * 菜单模块
   */
  @Column({ name: 'menu_module', type: 'varchar', length: 100, nullable: true })
  menuModule: string;

  /**
   * 菜单排序
   */
  @Column({ name: 'menu_sort', type: 'varchar', length: 10, nullable: true })
  menuSort: string;

  /**
   * 回调模块ID
   */
  @Column({ name: 'becall_module_id', type: 'bigint', nullable: true })
  becallModuleId: number;

  /**
   * 菜单层级
   */
  @Column({ name: 'level', type: 'int', default: 1 })
  level: number;

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
