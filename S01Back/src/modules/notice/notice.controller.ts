import { Controller, Get, Post, Param, Query, Request, UseGuards } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 通知模块控制器
 */
@Controller('api/notice')
@UseGuards(JwtAuthGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  /**
   * 获取通知列表
   */
  @Get('list')
  async getNoticeList(
    @Request() req,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    const data = await this.noticeService.getNoticeList(
      req.user.id,
      req.user.role,
      +page,
      +pageSize,
    );
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取未读通知数量（必须在 :id 路由之前定义）
   */
  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    const data = await this.noticeService.getUnreadCount(req.user.id, req.user.role);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取通知详情
   */
  @Get(':id')
  async getNoticeDetail(@Request() req, @Param('id') id: number) {
    const data = await this.noticeService.getNoticeDetail(id, req.user.id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 标记通知为已读
   */
  @Post(':id/read')
  async markAsRead(@Request() req, @Param('id') id: number) {
    const result = await this.noticeService.markAsRead(id, req.user.id);
    return { code: 200, data: result, message: '操作成功' };
  }

  /**
   * 标记所有通知为已读
   */
  @Post('read-all')
  async markAllAsRead(@Request() req) {
    const result = await this.noticeService.markAllAsRead(req.user.id, req.user.role);
    return { code: 200, data: result, message: '操作成功' };
  }
}
