import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 系统信息实体类
 */
@Entity('system_info')
export class SystemInfo {
  /**
   * 系统信息ID
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /**
   * 客户端IP
   */
  @Column({ name: 'client_ip', type: 'varchar', length: 50, nullable: true })
  clientIp: string;

  /**
   * 服务器域名
   */
  @Column({ name: 'server_domain', type: 'varchar', length: 255, nullable: true })
  serverDomain: string;

  /**
   * 版本号
   */
  @Column({ name: 'version', type: 'varchar', length: 20, nullable: true })
  version: string;

  /**
   * 主版本号
   */
  @Column({ name: 'major_version', type: 'int', default: 0 })
  majorVersion: number;

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
