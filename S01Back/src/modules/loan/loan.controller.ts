import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoanApplication } from '../../entities/loan-application.entity';
import { LoanFormConfig } from '../../entities/loan-form-config.entity';
import { LoanFormField } from '../../entities/loan-form-field.entity';

/**
 * 贷款模块控制器
 */
@Controller('api/loan')
@UseGuards(JwtAuthGuard)
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  // ==================== 学生申请功能 ====================

  /**
   * 获取可用的表单配置列表
   */
  @Get('form-configs')
  async getAvailableFormConfigs() {
    const data = await this.loanService.getAvailableFormConfigs();
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取表单配置详情及字段
   */
  @Get('form-config/:loanType')
  async getFormConfigWithFields(@Param('loanType') loanType: string) {
    const data = await this.loanService.getFormConfigWithFields(loanType);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 创建贷款申请
   */
  @Post('apply')
  async createApplication(@Request() req, @Body() data: Partial<LoanApplication>) {
    const result = await this.loanService.createApplication(req.user.id, data);
    return { code: 200, data: result, message: '创建成功' };
  }

  /**
   * 提交贷款申请
   */
  @Post('apply/:id/submit')
  async submitApplication(@Request() req, @Param('id') id: number) {
    const result = await this.loanService.submitApplication(req.user.id, id);
    return { code: 200, data: result, message: '提交成功' };
  }

  /**
   * 获取学生的申请列表
   */
  @Get('apply/list')
  async getStudentApplications(@Request() req, @Query('status') status?: string) {
    const data = await this.loanService.getStudentApplications(
      req.user.id,
      status as any,
    );
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取申请详情
   */
  @Get('apply/:id')
  async getApplicationDetail(@Param('id') id: number) {
    const data = await this.loanService.getApplicationDetail(id);
    return { code: 200, data, message: '获取成功' };
  }

  // ==================== 表单配置功能（总审核） ====================

  /**
   * 获取所有表单配置
   */
  @Get('form/config')
  async getAllFormConfigs() {
    const data = await this.loanService.getAllFormConfigs();
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 创建表单配置
   */
  @Post('form/config')
  async createFormConfig(@Request() req, @Body() data: Partial<LoanFormConfig>) {
    const result = await this.loanService.createFormConfig(req.user.id, data);
    return { code: 200, data: result, message: '创建成功' };
  }

  /**
   * 更新表单配置
   */
  @Put('form/config/:id')
  async updateFormConfig(
    @Param('id') id: number,
    @Body() data: Partial<LoanFormConfig>,
  ) {
    const result = await this.loanService.updateFormConfig(id, data);
    return { code: 200, data: result, message: '更新成功' };
  }

  /**
   * 保存表单字段
   */
  @Post('form/config/:id/fields')
  async saveFormFields(
    @Param('id') id: number,
    @Body() fields: Partial<LoanFormField>[],
  ) {
    const result = await this.loanService.saveFormFields(id, fields);
    return { code: 200, data: result, message: '保存成功' };
  }

  /**
   * 获取表单字段
   */
  @Get('form/config/:id/fields')
  async getFormFields(@Param('id') id: number) {
    const data = await this.loanService.getFormFields(id);
    return { code: 200, data, message: '获取成功' };
  }
}
