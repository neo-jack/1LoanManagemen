import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { AvatarUploadResponseDto } from './dto/avatar.dto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 头像服务
 */
@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // 确保上传目录存在
    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`创建头像上传目录: ${this.uploadDir}`);
    }
  }

  /**
   * 上传头像
   */
  async uploadAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<AvatarUploadResponseDto> {
    this.logger.log(`上传头像 - 用户ID: ${userId}, 文件名: ${file.originalname}`);

    // 生成新文件名（使用用户ID和时间戳）
    const fileExt = path.extname(file.originalname);
    const fileName = `avatar_${userId}_${Date.now()}${fileExt}`;
    const filePath = path.join(this.uploadDir, fileName);

    // 保存文件
    fs.writeFileSync(filePath, file.buffer);
    this.logger.log(`头像文件已保存: ${filePath}`);

    // 生成头像URL（相对路径）
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // 更新用户头像
    await this.userRepository.update(userId, {
      userAvatar: avatarUrl,
    });

    this.logger.log(`用户头像已更新 - 用户ID: ${userId}, URL: ${avatarUrl}`);

    return {
      avatarUrl,
      fileName,
      fileSize: file.size,
    };
  }

  /**
   * 获取用户头像URL
   */
  async getAvatarUrl(userId: number): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['userAvatar'],
    });

    return user?.userAvatar || null;
  }

  /**
   * 删除用户头像
   */
  async deleteAvatar(userId: number): Promise<boolean> {
    this.logger.log(`删除头像 - 用户ID: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['userAvatar'],
    });

    if (!user || !user.userAvatar) {
      return false;
    }

    // 删除文件
    const fileName = path.basename(user.userAvatar);
    const filePath = path.join(this.uploadDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`头像文件已删除: ${filePath}`);
    }

    // 更新用户头像为null
    await this.userRepository.update(userId, {
      userAvatar: null,
    });

    return true;
  }
}
