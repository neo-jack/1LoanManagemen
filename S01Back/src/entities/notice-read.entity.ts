import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * 通知阅读记录实体类
 */
@Entity('notice_reads')
export class NoticeRead {
  /**
   * 记录ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 通知ID
   */
  @Column({ name: 'notice_id', type: 'int' })
  noticeId: number;

  /**
   * 用户ID
   */
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  /**
   * 阅读时间
   */
  @CreateDateColumn({ name: 'read_time' })
  readTime: Date;
}
