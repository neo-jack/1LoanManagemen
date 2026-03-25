import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { RepaymentService } from './repayment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 还款与催收控制器
 */
@Controller('api/repayment')
@UseGuards(JwtAuthGuard)
export class RepaymentController {
  constructor(private readonly repaymentService: RepaymentService) {}

  // ==================== 学生还款功能 ====================

  /**
   * 获取学生的还款计划列表
   */
  @Get('plans')
  async getStudentPlans(@Request() req) {
    const data = await this.repaymentService.getStudentPlans(req.user.id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取还款计划详情
   */
  @Get('plan/:id')
  async getPlanDetail(@Param('id') id: number) {
    const data = await this.repaymentService.getPlanDetail(id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取还款提醒
   */
  @Get('reminders')
  async getReminders(@Request() req) {
    const data = await this.repaymentService.getRepaymentReminders(req.user.id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 在线还款（需上传还款凭证/发票）
   */
  @Post('pay/:scheduleId')
  async repay(
    @Request() req,
    @Param('scheduleId') scheduleId: number,
    @Body() body: { attachments?: any[] },
  ) {
    const data = await this.repaymentService.repay(req.user.id, scheduleId, body.attachments);
    return { code: 200, data, message: '还款成功' };
  }

  // ==================== 审核员统计与催收 ====================

  /**
   * 获取统计数据
   */
  @Get('statistics')
  async getStatistics() {
    const data = await this.repaymentService.getStatistics();
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取逾期贷款列表
   */
  @Get('overdue')
  async getOverdueList() {
    const data = await this.repaymentService.getOverdueList();
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 添加催收记录
   */
  @Post('collection')
  async addCollection(@Request() req, @Body() data: any) {
    const result = await this.repaymentService.addCollection(req.user.id, data);
    return { code: 200, data: result, message: '添加成功' };
  }

  /**
   * 获取催收记录
   */
  @Get('collections')
  async getCollections(@Query('applicationId') applicationId?: number) {
    const data = await this.repaymentService.getCollections(applicationId);
    return { code: 200, data, message: '获取成功' };
  }
}
