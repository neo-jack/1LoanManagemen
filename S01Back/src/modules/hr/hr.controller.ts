import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../../entities/user.entity';

/**
 * 人事模块控制器
 */
@Controller('api/hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ==================== 学生管理 ====================

  /**
   * 获取学生列表
   */
  @Get('student/list')
  async getStudentList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword?: string,
  ) {
    const data = await this.hrService.getStudentList(+page, +pageSize, keyword);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取学生详情
   */
  @Get('student/:id')
  async getStudentDetail(@Param('id') id: number) {
    const data = await this.hrService.getStudentDetail(id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 更新学生信息
   */
  @Put('student/:id')
  async updateStudent(@Param('id') id: number, @Body() data: Partial<User>) {
    const result = await this.hrService.updateStudent(id, data);
    return { code: 200, data: result, message: '更新成功' };
  }

  /**
   * 创建学生
   */
  @Post('student')
  async createStudent(@Body() data: Partial<User>) {
    const result = await this.hrService.createStudent(data);
    return { code: 200, data: result, message: '创建成功' };
  }

  /**
   * 删除学生
   */
  @Delete('student/:id')
  async deleteStudent(@Param('id') id: number) {
    const result = await this.hrService.deleteStudent(id);
    return { code: 200, data: result, message: '删除成功' };
  }

  // ==================== 审核员管理 ====================

  /**
   * 获取审核员列表
   */
  @Get('auditor/list')
  async getAuditorList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword?: string,
  ) {
    const data = await this.hrService.getAuditorList(+page, +pageSize, keyword);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取审核员详情
   */
  @Get('auditor/:id')
  async getAuditorDetail(@Param('id') id: number) {
    const data = await this.hrService.getAuditorDetail(id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 创建审核员
   */
  @Post('auditor')
  async createAuditor(@Body() data: Partial<User>) {
    const result = await this.hrService.createAuditor(data);
    return { code: 200, data: result, message: '创建成功' };
  }

  /**
   * 更新审核员信息
   */
  @Put('auditor/:id')
  async updateAuditor(@Param('id') id: number, @Body() data: Partial<User>) {
    const result = await this.hrService.updateAuditor(id, data);
    return { code: 200, data: result, message: '更新成功' };
  }

  /**
   * 删除审核员
   */
  @Delete('auditor/:id')
  async deleteAuditor(@Param('id') id: number) {
    const result = await this.hrService.deleteAuditor(id);
    return { code: 200, data: result, message: '删除成功' };
  }
}
