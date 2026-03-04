import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import * as crypto from 'crypto';

/**
 * 用户服务
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 用户登录验证
   */
  async login(username: string, password: string): Promise<User | null> {
    // 1. 优先从数据库查找
    const user = await this.userRepository.findOne({
      where: { username, password },
    });

    if (user) return user;

    // 2. 如果数据库没有，且匹配测试账号，则返回 mock 数据确保本地能登入
    const testAccounts: Record<string, Partial<User>> = {
      root1: {
        id: 1,
        username: 'root1',
        password: crypto.createHash('md5').update('123').digest('hex'),
        userName: '总审核员',
        userRole: 'admin',
        loanRole: 'superAuditor',
        hospitalCname: '演示银行',
        hospitalId: 1,
      },
      root2: {
        id: 2,
        username: 'root2',
        password: crypto.createHash('md5').update('123').digest('hex'),
        userName: '审核员',
        userRole: 'auditor',
        loanRole: 'auditor',
        hospitalCname: '演示银行',
        hospitalId: 1,
      },
      root3: {
        id: 3,
        username: 'root3',
        password: crypto.createHash('md5').update('123').digest('hex'),
        userName: '演示学生',
        userRole: 'user',
        loanRole: 'student',
        hospitalCname: '演示学校',
        hospitalId: 2,
      },
    };

    const mockUser = testAccounts[username];
    if (mockUser && mockUser.password === password) {
      console.log(`[Login] 使用测试账号登录: ${username}`);
      return mockUser as User;
    }

    return null;
  }

  /**
   * 根据ID查找用户
   */
  async findById(userId: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  /**
   * 根据ID获取用户
   */
  async getById(userId: number): Promise<User | null> {
    return this.findById(userId);
  }

  /**
   * 更新用户登录信息（这里简化处理，实际可能需要登录日志表）
   */
  async updateLoginInfo(userId: number, clientIp: string | null, token: string | null): Promise<void> {
    // 简化实现，实际项目可能需要更新登录日志表
    // 这里仅作占位
    console.log(`User ${userId} login info updated`);
  }
}
