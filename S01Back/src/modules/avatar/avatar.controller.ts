import {
  Controller,
  Post,
  Get,
  Delete,
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';
import { ResultDto } from '@/common/dto/result.dto';
import { AvatarUploadResponseDto } from './dto/avatar.dto';
import { JwtUtil } from '@/common/utils/jwt.util';

/**
 * 头像控制器
 */
@Controller('api/avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  /**
   * 上传头像
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<AvatarUploadResponseDto>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);

    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    if (!file) {
      return ResultDto.fail('请选择文件');
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return ResultDto.fail('只支持上传图片文件（jpg、png、gif、webp）');
    }

    // 验证文件大小（限制5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return ResultDto.fail('文件大小不能超过5MB');
    }

    const userId = JwtUtil.getUserIdFromToken(jwtToken);
    const result = await this.avatarService.uploadAvatar(userId, file);

    return ResultDto.success(result, '头像上传成功');
  }

  /**
   * 获取当前用户头像URL
   */
  @Get('url')
  async getAvatarUrl(
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<string>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);

    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    const userId = JwtUtil.getUserIdFromToken(jwtToken);
    const avatarUrl = await this.avatarService.getAvatarUrl(userId);

    if (!avatarUrl) {
      return ResultDto.fail('未设置头像');
    }

    return ResultDto.success(avatarUrl, '获取头像URL成功');
  }

  /**
   * 删除当前用户头像
   */
  @Delete('delete')
  async deleteAvatar(
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<void>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);

    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    const userId = JwtUtil.getUserIdFromToken(jwtToken);
    const success = await this.avatarService.deleteAvatar(userId);

    if (!success) {
      return ResultDto.fail('删除失败，头像不存在');
    }

    return ResultDto.success(null, '删除头像成功');
  }
}
