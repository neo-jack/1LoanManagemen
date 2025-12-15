import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAvatar } from '@/entities/user-avatar.entity';

/**
 * 数据库头像文件访问控制器
 * 处理 /database/avatars/:fileName 路径的请求
 * 从数据库读取 base64 数据并返回图片
 */
@Controller('database/avatars')
export class DatabaseAvatarController {
  constructor(
    @InjectRepository(UserAvatar)
    private readonly userAvatarRepository: Repository<UserAvatar>,
  ) {}

  /**
   * 根据文件名获取头像图片
   * GET /database/avatars/:fileName
   */
  @Get(':fileName')
  async getAvatar(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      console.log(`[DatabaseAvatarController] 获取头像文件: ${fileName}`);

      // 从数据库查找头像记录
      const avatar = await this.userAvatarRepository.findOne({
        where: { fileName },
      });

      if (!avatar || !avatar.data) {
        console.warn(`[DatabaseAvatarController] 头像不存在: ${fileName}`);
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
      console.error(`[DatabaseAvatarController] 获取头像失败: ${e.message}`);
      res.status(500).send('服务器内部错误');
    }
  }
}
