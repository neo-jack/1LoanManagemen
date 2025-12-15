import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanApplication, LoanStatus } from '../../entities/loan-application.entity';
import { LoanFormConfig } from '../../entities/loan-form-config.entity';
import { LoanFormField } from '../../entities/loan-form-field.entity';
import { FlowConfig } from '../../entities/flow-config.entity';
import { FlowNode } from '../../entities/flow-node.entity';
import { FlowInstance } from '../../entities/flow-instance.entity';
import { FlowTask } from '../../entities/flow-task.entity';
import { User } from '../../entities/user.entity';

/**
 * 贷款服务
 */
@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly loanAppRepo: Repository<LoanApplication>,
    @InjectRepository(LoanFormConfig)
    private readonly formConfigRepo: Repository<LoanFormConfig>,
    @InjectRepository(LoanFormField)
    private readonly formFieldRepo: Repository<LoanFormField>,
    @InjectRepository(FlowConfig)
    private readonly flowConfigRepo: Repository<FlowConfig>,
    @InjectRepository(FlowNode)
    private readonly flowNodeRepo: Repository<FlowNode>,
    @InjectRepository(FlowInstance)
    private readonly flowInstanceRepo: Repository<FlowInstance>,
    @InjectRepository(FlowTask)
    private readonly flowTaskRepo: Repository<FlowTask>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 生成申请编号
   */
  private generateApplicationNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LOAN${dateStr}${random}`;
  }

  // ==================== 学生申请功能 ====================

  /**
   * 获取可用的表单配置列表（学生用）
   */
  async getAvailableFormConfigs() {
    return this.formConfigRepo.find({
      where: { isActive: 1 },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取表单配置详情及字段
   */
  async getFormConfigWithFields(loanType: string) {
    const config = await this.formConfigRepo.findOne({
      where: { loanType, isActive: 1 },
    });
    if (!config) {
      throw new NotFoundException('表单配置不存在');
    }

    const fields = await this.formFieldRepo.find({
      where: { configId: config.id },
      order: { sortOrder: 'ASC' },
    });

    return { config, fields };
  }

  /**
   * 创建贷款申请（草稿）
   */
  async createApplication(userId: number, data: Partial<LoanApplication>) {
    const application = this.loanAppRepo.create({
      ...data,
      userId,
      applicationNo: this.generateApplicationNo(),
      status: 'draft',
    });
    return this.loanAppRepo.save(application);
  }

  /**
   * 提交贷款申请
   */
  async submitApplication(userId: number, applicationId: number) {
    const application = await this.loanAppRepo.findOne({
      where: { id: applicationId, userId },
    });
    if (!application) {
      throw new NotFoundException('申请不存在');
    }
    if (application.status !== 'draft') {
      throw new ForbiddenException('只能提交草稿状态的申请');
    }

    // 获取流程配置
    const flowConfig = await this.flowConfigRepo.findOne({
      where: { businessType: application.loanType, status: 'active' },
    });
    if (!flowConfig) {
      throw new NotFoundException('未找到对应的审批流程');
    }

    // 获取第一个审核节点
    const firstAuditNode = await this.flowNodeRepo.findOne({
      where: { flowId: flowConfig.id, nodeType: 'audit' },
      order: { sortOrder: 'ASC' },
    });
    if (!firstAuditNode) {
      throw new NotFoundException('流程配置异常，缺少审核节点');
    }

    // 创建流程实例
    const flowInstance = await this.flowInstanceRepo.save({
      flowId: flowConfig.id,
      businessType: 'loan_application',
      businessId: application.id,
      currentNodeId: firstAuditNode.id,
      status: 'running',
      initiatorId: userId,
    });

    // 创建审核任务
    const auditors = await this.userRepo.find({
      where: { loanRole: firstAuditNode.auditorRole as any },
    });
    for (const auditor of auditors) {
      await this.flowTaskRepo.save({
        instanceId: flowInstance.id,
        nodeId: firstAuditNode.id,
        taskType: 'audit',
        assigneeId: auditor.id,
        status: 'pending',
      });
    }

    // 更新申请状态
    application.status = 'pending';
    application.currentNodeId = firstAuditNode.id;
    application.submitTime = new Date();
    return this.loanAppRepo.save(application);
  }

  /**
   * 获取学生的申请列表
   */
  async getStudentApplications(userId: number, status?: LoanStatus) {
    const query = this.loanAppRepo.createQueryBuilder('app')
      .where('app.user_id = :userId', { userId });
    
    if (status) {
      query.andWhere('app.status = :status', { status });
    }
    
    return query.orderBy('app.created_at', 'DESC').getMany();
  }

  /**
   * 获取申请详情
   */
  async getApplicationDetail(applicationId: number) {
    const application = await this.loanAppRepo.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('申请不存在');
    }

    // 获取表单配置
    const { config, fields } = await this.getFormConfigWithFields(application.loanType);

    // 获取流程实例和任务
    const flowInstance = await this.flowInstanceRepo.findOne({
      where: { businessType: 'loan_application', businessId: applicationId },
    });

    let flowTasks = [];
    if (flowInstance) {
      flowTasks = await this.flowTaskRepo.find({
        where: { instanceId: flowInstance.id },
        order: { createdAt: 'ASC' },
      });
    }

    return {
      application,
      formConfig: config,
      formFields: fields,
      flowInstance,
      flowTasks,
    };
  }

  // ==================== 表单配置功能（总审核） ====================

  /**
   * 获取所有表单配置
   */
  async getAllFormConfigs() {
    return this.formConfigRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 创建表单配置
   */
  async createFormConfig(userId: number, data: Partial<LoanFormConfig>) {
    const config = this.formConfigRepo.create({
      ...data,
      createdBy: userId,
    });
    return this.formConfigRepo.save(config);
  }

  /**
   * 更新表单配置
   */
  async updateFormConfig(configId: number, data: Partial<LoanFormConfig>) {
    await this.formConfigRepo.update(configId, data);
    return this.formConfigRepo.findOne({ where: { id: configId } });
  }

  /**
   * 保存表单字段
   */
  async saveFormFields(configId: number, fields: Partial<LoanFormField>[]) {
    // 删除旧字段
    await this.formFieldRepo.delete({ configId });
    
    // 保存新字段
    const newFields = fields.map((field, index) => ({
      ...field,
      configId,
      sortOrder: index,
    }));
    return this.formFieldRepo.save(newFields);
  }

  /**
   * 获取表单字段
   */
  async getFormFields(configId: number) {
    return this.formFieldRepo.find({
      where: { configId },
      order: { sortOrder: 'ASC' },
    });
  }
}
