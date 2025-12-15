import { Controller, Post, Body, Headers, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ResultDto } from '@/common/dto/result.dto';
import { JwtUtil } from '@/common/utils/jwt.util';
import { UserAvatar } from '@/entities/user-avatar.entity';
import { User } from '@/entities/user.entity';

/**
 * 头像上传请求DTO
 */
class AvatarUploadRequest {
  @IsString()
  @IsNotEmpty({ message: '头像数据不能为空' })
  avatar: string; // Base64格式的头像数据
}

/**
 * 头像上传响应DTO
 */
class AvatarUploadResponse {
  url: string;
  id: number;
  message: string;
  userId?: number;
}

/**
 * 用户头像控制器
 * 兼容 Java 端 UserAvatarController 的接口
 * 路径：/api/user/avatorupload, /api/user/getheadshotlist
 */
@Controller('api/user')
export class UserAvatarController {
  constructor(
    @InjectRepository(UserAvatar)
    private readonly userAvatarRepository: Repository<UserAvatar>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 获取用户头像列表
   * POST /api/user/getheadshotlist
   */
  @Post('getheadshotlist')
  async getHeadshotList(@Headers('authorization') token?: string): Promise<ResultDto<UserAvatar[]>> {
    try {
      // 从token获取用户ID
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.error(401, '缺少授权token');
      }

      const jwtToken = token.substring(7);
      const userId = JwtUtil.getUserIdFromToken(jwtToken);
      if (!userId) {
        return ResultDto.error(401, '无效的用户token');
      }

      console.log(`[UserAvatarController] 获取用户${userId}的头像列表`);
      const avatars = await this.userAvatarRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      return ResultDto.success(avatars, '获取头像列表成功');
    } catch (e) {
      console.error(`[UserAvatarController] 获取头像列表失败: ${e.message}`);
      return ResultDto.error(500, '服务器内部错误');
    }
  }

  /**
   * 上传头像
   * POST /api/user/avatorupload
   * 接收 Base64 格式的头像数据
   */
  @Post('avatorupload')
  async uploadAvatar(
    @Body() request: AvatarUploadRequest,
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<AvatarUploadResponse>> {
    try {
      // 从token获取用户ID
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.error(401, '缺少授权token');
      }

      const jwtToken = token.substring(7);
      const userId = JwtUtil.getUserIdFromToken(jwtToken);
      if (!userId) {
        return ResultDto.error(401, '无效的用户token');
      }

      if (!request.avatar || request.avatar.trim() === '') {
        return ResultDto.error(400, '头像数据不能为空');
      }

      // 解析base64数据
      let base64Data = request.avatar;
      if (base64Data.startsWith('data:')) {
        const commaIndex = base64Data.indexOf(',');
        if (commaIndex !== -1) {
          base64Data = base64Data.substring(commaIndex + 1);
        }
      }

      // 生成文件名和URL
      const fileName = `user_${userId}_${Date.now()}.png`;
      const fileUrl = `/database/avatars/${fileName}`;

      // 创建头像记录
      const avatar = this.userAvatarRepository.create({
        userId,
        fileName,
        fileUrl,
        mimeType: 'image/png',
        fileSize: base64Data.length,
        data: request.avatar, // 保存原始base64数据
        isCurrent: false,
      });

      // 保存头像记录
      const saved = await this.userAvatarRepository.save(avatar);

      // 同时更新users表的user_avatar字段
      await this.userRepository.update({ id: userId }, { userAvatar: fileUrl });

      console.log(`[UserAvatarController] 用户${userId}上传头像成功，文件名: ${fileName}`);

      // 构造响应
      const response: AvatarUploadResponse = {
        url: fileUrl,
        id: saved.id,
        message: '头像上传成功',
        userId,
      };

      return ResultDto.success(response, '头像上传成功');
    } catch (e) {
      console.error(`[UserAvatarController] 头像上传失败: ${e.message}`);
      return ResultDto.error(500, '服务器内部错误');
    }
  }

  /**
   * 获取用户当前头像
   * POST /api/user/getcurrentavatar
   */
  @Post('getcurrentavatar')
  async getCurrentAvatar(@Headers('authorization') token?: string): Promise<ResultDto<UserAvatar>> {
    try {
      // 从token获取用户ID
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.error(401, '缺少授权token');
      }

      const jwtToken = token.substring(7);
      const userId = JwtUtil.getUserIdFromToken(jwtToken);
      if (!userId) {
        return ResultDto.error(401, '无效的用户token');
      }

      console.log(`[UserAvatarController] 获取用户${userId}的当前头像`);
      const currentAvatar = await this.userAvatarRepository.findOne({
        where: { userId, isCurrent: true },
      });

      return ResultDto.success(currentAvatar, '获取当前头像成功');
    } catch (e) {
      console.error(`[UserAvatarController] 获取当前头像失败: ${e.message}`);
      return ResultDto.error(500, '服务器内部错误');
    }
  }

  /**
   * 设置头像为当前头像
   * POST /api/user/setcurrentavatar
   */
  @Post('setcurrentavatar')
  async setCurrentAvatar(
    @Body() request: { avatarId: number },
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<string>> {
    try {
      // 从token获取用户ID
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.error(401, '缺少授权token');
      }

      const jwtToken = token.substring(7);
      const userId = JwtUtil.getUserIdFromToken(jwtToken);
      if (!userId) {
        return ResultDto.error(401, '无效的用户token');
      }

      if (!request.avatarId) {
        return ResultDto.error(400, '头像ID不能为空');
      }

      console.log(`[UserAvatarController] 用户${userId}设置头像${request.avatarId}为当前头像`);

      // 先将所有头像设为非当前
      await this.userAvatarRepository.update({ userId }, { isCurrent: false });

      // 将指定头像设为当前
      const result = await this.userAvatarRepository.update(
        { id: request.avatarId, userId },
        { isCurrent: true },
      );

      if (result.affected > 0) {
        // 更新用户表的头像字段
        const avatar = await this.userAvatarRepository.findOne({
          where: { id: request.avatarId },
        });
        if (avatar) {
          await this.userRepository.update({ id: userId }, { userAvatar: avatar.fileUrl });
        }
        return ResultDto.success('设置当前头像成功');
      } else {
        return ResultDto.error(400, '设置当前头像失败');
      }
    } catch (e) {
      console.error(`[UserAvatarController] 设置当前头像失败: ${e.message}`);
      return ResultDto.error(500, '服务器内部错误');
    }
  }

  /**
   * 根据文件名获取头像图片
   * GET /api/user/avatar/:fileName
   * 返回图片数据（从数据库 data 字段读取 base64 并转换为图片）
   */
  @Get('avatar/:fileName')
  async getAvatarByFileName(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      console.log(`[UserAvatarController] 获取头像文件: ${fileName}`);

      // 从数据库查找头像记录
      const avatar = await this.userAvatarRepository.findOne({
        where: { fileName },
      });

      if (!avatar || !avatar.data) {
        res.status(404).send('头像不存在');
        return;
      }

      // 解析 base64 数据
      let base64Data = avatar.data;
      let mimeType = avatar.mimeType || 'image/png';

      // 如果 data 包含 data:image/xxx;base64, 前缀，需要解析
      if (base64Data.startsWith('data:')) {
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      // 将 base64 转换为 Buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // 设置响应头并返回图片
      res.set('Content-Type', mimeType);
      res.set('Content-Length', imageBuffer.length.toString());
      res.set('Cache-Control', 'public, max-age=86400'); // 缓存 1 天
      res.send(imageBuffer);
    } catch (e) {
      console.error(`[UserAvatarController] 获取头像失败: ${e.message}`);
      res.status(500).send('服务器内部错误');
    }
  }
}
