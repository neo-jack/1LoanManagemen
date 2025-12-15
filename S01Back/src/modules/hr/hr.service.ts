import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as CryptoJS from 'crypto-js';

/**
 * 人事服务
 */
@Injectable()
export class HrService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * MD5加密密码
   */
  private encryptPassword(password: string): string {
    return CryptoJS.MD5(password).toString();
  }

  // ==================== 学生管理 ====================

  /**
   * 获取学生列表
   */
  async getStudentList(page = 1, pageSize = 10, keyword?: string) {
    const query = this.userRepo.createQueryBuilder('user')
      .where('user.loan_role = :role', { role: 'student' });
    
    if (keyword) {
      query.andWhere('(user.username LIKE :keyword OR user.user_name LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.created_at', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 获取学生详情
   */
  async getStudentDetail(id: number) {
    const student = await this.userRepo.findOne({
      where: { id, loanRole: 'student' },
    });
    if (!student) {
      throw new NotFoundException('学生不存在');
    }
    return student;
  }

  /**
   * 更新学生信息
   */
  async updateStudent(id: number, data: Partial<User>) {
    const student = await this.userRepo.findOne({
      where: { id, loanRole: 'student' },
    });
    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    // 不允许修改角色
    delete data.loanRole;
    delete data.userRole;
    
    // 如果修改密码，需要加密
    if (data.password) {
      data.password = this.encryptPassword(data.password);
    }

    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
  }

  /**
   * 创建学生
   */
  async createStudent(data: Partial<User>) {
    // 检查用户名是否已存在
    const existing = await this.userRepo.findOne({
      where: { username: data.username },
    });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    if (data.password) {
      data.password = this.encryptPassword(data.password);
    }

    // 设置学生角色
    data.loanRole = 'student';
    data.userRole = 'user';

    const student = this.userRepo.create(data);
    return this.userRepo.save(student);
  }

  /**
   * 删除学生
   */
  async deleteStudent(id: number) {
    const student = await this.userRepo.findOne({
      where: { id, loanRole: 'student' },
    });
    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    await this.userRepo.delete(id);
    return { success: true };
  }

  // ==================== 审核员管理 ====================

  /**
   * 获取审核员列表
   */
  async getAuditorList(page = 1, pageSize = 10, keyword?: string) {
    const query = this.userRepo.createQueryBuilder('user')
      .where('user.loan_role IN (:...roles)', { roles: ['auditor', 'superAuditor'] });
    
    if (keyword) {
      query.andWhere('(user.username LIKE :keyword OR user.user_name LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.created_at', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 获取审核员详情
   */
  async getAuditorDetail(id: number) {
    const auditor = await this.userRepo.findOne({
      where: { id },
    });
    if (!auditor || (auditor.loanRole !== 'auditor' && auditor.loanRole !== 'superAuditor')) {
      throw new NotFoundException('审核员不存在');
    }
    return auditor;
  }

  /**
   * 创建审核员
   */
  async createAuditor(data: Partial<User>) {
    // 检查用户名是否已存在
    const existing = await this.userRepo.findOne({
      where: { username: data.username },
    });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    if (data.password) {
      data.password = this.encryptPassword(data.password);
    }

    // 设置默认角色
    data.loanRole = data.loanRole || 'auditor';
    data.userRole = 'user';

    const auditor = this.userRepo.create(data);
    return this.userRepo.save(auditor);
  }

  /**
   * 更新审核员信息
   */
  async updateAuditor(id: number, data: Partial<User>) {
    const auditor = await this.userRepo.findOne({
      where: { id },
    });
    if (!auditor || (auditor.loanRole !== 'auditor' && auditor.loanRole !== 'superAuditor')) {
      throw new NotFoundException('审核员不存在');
    }

    // 如果修改密码，需要加密
    if (data.password) {
      data.password = this.encryptPassword(data.password);
    }

    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
  }

  /**
   * 删除审核员
   */
  async deleteAuditor(id: number) {
    const auditor = await this.userRepo.findOne({
      where: { id },
    });
    if (!auditor || auditor.loanRole !== 'auditor') {
      throw new NotFoundException('审核员不存在或无法删除');
    }

    await this.userRepo.delete(id);
    return { success: true };
  }
}
