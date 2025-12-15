import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { FlowService } from './flow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlowConfig } from '../../entities/flow-config.entity';
import { FlowNode } from '../../entities/flow-node.entity';

/**
 * 流程模块控制器
 */
@Controller('api/flow')
@UseGuards(JwtAuthGuard)
export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  // ==================== 流程配置功能（总审核） ====================

  /**
   * 获取所有流程配置
   */
  @Get('config')
  async getAllFlowConfigs() {
    const data = await this.flowService.getAllFlowConfigs();
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取流程配置详情及节点
   */
  @Get('config/:id')
  async getFlowConfigWithNodes(@Param('id') id: number) {
    const data = await this.flowService.getFlowConfigWithNodes(id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 创建流程配置
   */
  @Post('config')
  async createFlowConfig(@Request() req, @Body() data: Partial<FlowConfig>) {
    const result = await this.flowService.createFlowConfig(req.user.id, data);
    return { code: 200, data: result, message: '创建成功' };
  }

  /**
   * 更新流程配置
   */
  @Put('config/:id')
  async updateFlowConfig(
    @Param('id') id: number,
    @Body() data: Partial<FlowConfig>,
  ) {
    const result = await this.flowService.updateFlowConfig(id, data);
    return { code: 200, data: result, message: '更新成功' };
  }

  /**
   * 保存流程节点
   */
  @Post('config/:id/nodes')
  async saveFlowNodes(
    @Param('id') id: number,
    @Body() nodes: Partial<FlowNode>[],
  ) {
    const result = await this.flowService.saveFlowNodes(id, nodes);
    return { code: 200, data: result, message: '保存成功' };
  }

  /**
   * 提交流程配置审核
   */
  @Post('config/:id/submit')
  async submitFlowConfig(@Param('id') id: number) {
    const result = await this.flowService.submitFlowConfig(id);
    return { code: 200, data: result, message: '提交成功' };
  }

  /**
   * 审核通过流程配置
   */
  @Post('config/:id/approve')
  async approveFlowConfig(@Param('id') id: number) {
    const result = await this.flowService.approveFlowConfig(id);
    return { code: 200, data: result, message: '审核通过' };
  }

  // ==================== 流程审核功能 ====================

  /**
   * 获取待办任务列表
   */
  @Get('audit/todo')
  async getTodoTasks(@Request() req) {
    const data = await this.flowService.getTodoTasks(req.user.id, req.user.role);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取已办任务列表
   */
  @Get('audit/done')
  async getDoneTasks(@Request() req) {
    const data = await this.flowService.getDoneTasks(req.user.id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取已抄送任务列表
   */
  @Get('audit/copied')
  async getCopiedTasks(@Request() req) {
    const data = await this.flowService.getCopiedTasks(req.user.id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 获取任务详情
   */
  @Get('audit/task/:id')
  async getTaskDetail(@Param('id') id: number) {
    const data = await this.flowService.getTaskDetail(id);
    return { code: 200, data, message: '获取成功' };
  }

  /**
   * 审批通过
   */
  @Post('audit/:id/approve')
  async approveTask(
    @Request() req,
    @Param('id') id: number,
    @Body() body: { comment?: string },
  ) {
    const result = await this.flowService.approveTask(req.user.id, id, body.comment);
    return { code: 200, data: result, message: '审批通过' };
  }

  /**
   * 审批驳回
   */
  @Post('audit/:id/reject')
  async rejectTask(
    @Request() req,
    @Param('id') id: number,
    @Body() body: { comment: string },
  ) {
    const result = await this.flowService.rejectTask(req.user.id, id, body.comment);
    return { code: 200, data: result, message: '审批驳回' };
  }
}
