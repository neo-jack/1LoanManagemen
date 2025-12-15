import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';

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
    const user = await this.userRepository.findOne({
      where: { username, password },
    });
    return user;
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
