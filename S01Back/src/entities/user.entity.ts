import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 用户实体类
 */
@Entity('users')
export class User {
  /**
   * 用户ID
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /**
   * 用户名
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  /**
   * 密码（MD5加密）
   */
  @Column({ type: 'varchar', length: 255 })
  password: string;

  /**
   * 用户姓名
   */
  @Column({ name: 'user_name', type: 'varchar', length: 100, nullable: true })
  userName: string;

  /**
   * 用户头像
   */
  @Column({ name: 'user_avatar', type: 'varchar', length: 255, nullable: true })
  userAvatar: string;

  /**
   * 用户角色
   */
  @Column({ name: 'user_role', type: 'varchar', length: 50, nullable: true })
  userRole: string;

  /**
   * 贷款系统角色：student(学生)/auditor(审核员)/superAuditor(总审核)
   */
  @Column({ name: 'loan_role', type: 'enum', enum: ['student', 'auditor', 'superAuditor'], default: 'student' })
  loanRole: 'student' | 'auditor' | 'superAuditor';

  /**
   * 医院ID
   */
  @Column({ name: 'hospital_id', type: 'bigint', nullable: true })
  hospitalId: number;

  /**
   * 医院名称
   */
  @Column({ name: 'hospital_cname', type: 'varchar', length: 255, default: '' })
  hospitalCname: string;

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
