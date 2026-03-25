import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Request, Res,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { Response } from 'express';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoanApplication } from '../../entities/loan-application.entity';
import { LoanFormConfig } from '../../entities/loan-form-config.entity';
import { LoanFormField } from '../../entities/loan-form-field.entity';

/**
 * 附件文件存储配置
 */
const attachmentStorage = diskStorage({
  destination: join(__dirname, '..', '..', '..', 'uploads', 'attachments'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

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

  // ==================== 附件管理 ====================

  /**
   * 上传附件
   */
  @Post('attachment/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: attachmentStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }
    // Multer 中文文件名修复：latin1 -> utf8
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    return {
      code: 200,
      data: {
        uid: file.filename,
        name: originalName,
        filename: file.filename,
        url: `/uploads/attachments/${file.filename}`,
        size: file.size,
        type: file.mimetype,
      },
      message: '上传成功',
    };
  }

  /**
   * 下载附件
   */
  @Get('attachment/download/:filename')
  async downloadAttachment(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = join(__dirname, '..', '..', '..', 'uploads', 'attachments', filename);
    if (!existsSync(filePath)) {
      throw new BadRequestException('文件不存在');
    }
    // 设置下载头，支持中文文件名
    const encodedName = encodeURIComponent(filename);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.sendFile(filePath);
  }

  /**
   * 删除附件
   */
  @Delete('attachment/:filename')
  async deleteAttachment(@Param('filename') filename: string) {
    const filePath = join(__dirname, '..', '..', '..', 'uploads', 'attachments', filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    return { code: 200, message: '删除成功' };
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
