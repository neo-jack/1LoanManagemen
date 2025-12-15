import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 用户头像实体类
 * 对应数据库表 user_avatars，字段与 Java 端 UserAvatar 实体一致
 */
@Entity('user_avatars')
export class UserAvatar {
  /**
   * 主键ID
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /**
   * 用户ID
   */
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  /**
   * 文件名
   */
  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string;

  /**
   * 文件访问URL
   */
  @Column({ name: 'file_url', type: 'varchar', length: 255, nullable: true })
  fileUrl: string;

  /**
   * 文件大小(字节)
   */
  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number;

  /**
   * MIME类型
   */
  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string;

  /**
   * Base64编码的图片数据
   */
  @Column({ name: 'data', type: 'longtext', nullable: true })
  data: string;

  /**
   * 是否为当前头像(1:是, 0:否)
   */
  @Column({ name: 'is_current', type: 'tinyint', default: 0 })
  isCurrent: boolean;

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
