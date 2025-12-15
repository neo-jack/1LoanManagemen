import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FlowConfig, FlowConfigStatus } from '../../entities/flow-config.entity';
import { FlowNode } from '../../entities/flow-node.entity';
import { FlowInstance } from '../../entities/flow-instance.entity';
import { FlowTask, TaskStatus } from '../../entities/flow-task.entity';
import { LoanApplication } from '../../entities/loan-application.entity';
import { User } from '../../entities/user.entity';

/**
 * 流程服务
 */
@Injectable()
export class FlowService {
  constructor(
    @InjectRepository(FlowConfig)
    private readonly flowConfigRepo: Repository<FlowConfig>,
    @InjectRepository(FlowNode)
    private readonly flowNodeRepo: Repository<FlowNode>,
    @InjectRepository(FlowInstance)
    private readonly flowInstanceRepo: Repository<FlowInstance>,
    @InjectRepository(FlowTask)
    private readonly flowTaskRepo: Repository<FlowTask>,
    @InjectRepository(LoanApplication)
    private readonly loanAppRepo: Repository<LoanApplication>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ==================== 流程配置功能（总审核） ====================

  /**
   * 获取所有流程配置
   */
  async getAllFlowConfigs() {
    return this.flowConfigRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取流程配置详情及节点
   */
  async getFlowConfigWithNodes(flowId: number) {
    const config = await this.flowConfigRepo.findOne({
      where: { id: flowId },
    });
    if (!config) {
      throw new NotFoundException('流程配置不存在');
    }

    const nodes = await this.flowNodeRepo.find({
      where: { flowId },
      order: { sortOrder: 'ASC' },
    });

    return { config, nodes };
  }

  /**
   * 创建流程配置
   */
  async createFlowConfig(userId: number, data: Partial<FlowConfig>) {
    const config = this.flowConfigRepo.create({
      ...data,
      createdBy: userId,
      status: 'draft',
    });
    return this.flowConfigRepo.save(config);
  }

  /**
   * 更新流程配置
   */
  async updateFlowConfig(flowId: number, data: Partial<FlowConfig>) {
    await this.flowConfigRepo.update(flowId, data);
    return this.flowConfigRepo.findOne({ where: { id: flowId } });
  }

  /**
   * 保存流程节点
   */
  async saveFlowNodes(flowId: number, nodes: Partial<FlowNode>[]) {
    // 删除旧节点
    await this.flowNodeRepo.delete({ flowId });
    
    // 保存新节点
    const newNodes = nodes.map((node, index) => ({
      ...node,
      flowId,
      sortOrder: index,
    }));
    const savedNodes = await this.flowNodeRepo.save(newNodes);

    // 更新节点的下一节点ID
    for (let i = 0; i < savedNodes.length - 1; i++) {
      savedNodes[i].nextNodeId = savedNodes[i + 1].id;
    }
    await this.flowNodeRepo.save(savedNodes);

    return savedNodes;
  }

  /**
   * 提交流程配置审核
   */
  async submitFlowConfig(flowId: number) {
    const config = await this.flowConfigRepo.findOne({
      where: { id: flowId },
    });
    if (!config) {
      throw new NotFoundException('流程配置不存在');
    }
    if (config.status !== 'draft') {
      throw new ForbiddenException('只能提交草稿状态的配置');
    }

    config.status = 'pending';
    return this.flowConfigRepo.save(config);
  }

  /**
   * 审核通过流程配置
   */
  async approveFlowConfig(flowId: number) {
    const config = await this.flowConfigRepo.findOne({
      where: { id: flowId },
    });
    if (!config) {
      throw new NotFoundException('流程配置不存在');
    }

    config.status = 'active';
    return this.flowConfigRepo.save(config);
  }

  // ==================== 流程审核功能 ====================

  /**
   * 获取待办任务列表
   */
  async getTodoTasks(userId: number, userRole: string) {
    const tasks = await this.flowTaskRepo.find({
      where: {
        assigneeId: userId,
        status: 'pending',
        taskType: 'audit',
      },
      order: { createdAt: 'DESC' },
    });

    // 获取关联的业务数据
    return this.enrichTasksWithBusinessData(tasks);
  }

  /**
   * 获取已办任务列表
   */
  async getDoneTasks(userId: number) {
    const tasks = await this.flowTaskRepo.find({
      where: {
        assigneeId: userId,
        status: In(['approved', 'rejected']),
      },
      order: { handleTime: 'DESC' },
    });

    return this.enrichTasksWithBusinessData(tasks);
  }

  /**
   * 获取已抄送任务列表
   */
  async getCopiedTasks(userId: number) {
    const tasks = await this.flowTaskRepo.find({
      where: {
        assigneeId: userId,
        taskType: 'cc',
      },
      order: { createdAt: 'DESC' },
    });

    return this.enrichTasksWithBusinessData(tasks);
  }

  /**
   * 丰富任务数据（添加业务信息）
   */
  private async enrichTasksWithBusinessData(tasks: FlowTask[]) {
    const enrichedTasks = [];
    for (const task of tasks) {
      const instance = await this.flowInstanceRepo.findOne({
        where: { id: task.instanceId },
      });
      
      let businessData = null;
      if (instance && instance.businessType === 'loan_application') {
        businessData = await this.loanAppRepo.findOne({
          where: { id: instance.businessId },
        });
      }

      const node = await this.flowNodeRepo.findOne({
        where: { id: task.nodeId },
      });

      enrichedTasks.push({
        ...task,
        instance,
        businessData,
        node,
      });
    }
    return enrichedTasks;
  }

  /**
   * 审批通过
   */
  async approveTask(userId: number, taskId: number, comment?: string) {
    const task = await this.flowTaskRepo.findOne({
      where: { id: taskId, assigneeId: userId, status: 'pending' },
    });
    if (!task) {
      throw new NotFoundException('任务不存在或已处理');
    }

    // 更新任务状态
    task.status = 'approved';
    task.comment = comment;
    task.handleTime = new Date();
    await this.flowTaskRepo.save(task);

    // 取消同节点其他待处理任务
    await this.flowTaskRepo.update(
      { instanceId: task.instanceId, nodeId: task.nodeId, status: 'pending' },
      { status: 'cancelled' }
    );

    // 获取流程实例和当前节点
    const instance = await this.flowInstanceRepo.findOne({
      where: { id: task.instanceId },
    });
    const currentNode = await this.flowNodeRepo.findOne({
      where: { id: task.nodeId },
    });

    // 流转到下一节点
    if (currentNode.nextNodeId) {
      const nextNode = await this.flowNodeRepo.findOne({
        where: { id: currentNode.nextNodeId },
      });

      if (nextNode.nodeType === 'end') {
        // 流程结束
        instance.status = 'completed';
        instance.endTime = new Date();
        instance.currentNodeId = nextNode.id;
        await this.flowInstanceRepo.save(instance);

        // 更新业务状态
        if (instance.businessType === 'loan_application') {
          await this.loanAppRepo.update(
            { id: instance.businessId },
            { status: 'approved', currentNodeId: nextNode.id }
          );
        }
      } else if (nextNode.nodeType === 'audit') {
        // 创建下一节点的审核任务
        instance.currentNodeId = nextNode.id;
        await this.flowInstanceRepo.save(instance);

        // 根据角色分配审核人
        const auditors = await this.userRepo.find({
          where: { loanRole: nextNode.auditorRole as any },
        });
        for (const auditor of auditors) {
          await this.flowTaskRepo.save({
            instanceId: instance.id,
            nodeId: nextNode.id,
            taskType: 'audit',
            assigneeId: auditor.id,
            status: 'pending',
          });
        }

        // 更新业务状态
        if (instance.businessType === 'loan_application') {
          await this.loanAppRepo.update(
            { id: instance.businessId },
            { status: 'auditing', currentNodeId: nextNode.id }
          );
        }
      }
    }

    return task;
  }

  /**
   * 审批驳回
   */
  async rejectTask(userId: number, taskId: number, comment: string) {
    const task = await this.flowTaskRepo.findOne({
      where: { id: taskId, assigneeId: userId, status: 'pending' },
    });
    if (!task) {
      throw new NotFoundException('任务不存在或已处理');
    }

    // 更新任务状态
    task.status = 'rejected';
    task.comment = comment;
    task.handleTime = new Date();
    await this.flowTaskRepo.save(task);

    // 取消同节点其他待处理任务
    await this.flowTaskRepo.update(
      { instanceId: task.instanceId, nodeId: task.nodeId, status: 'pending' },
      { status: 'cancelled' }
    );

    // 更新流程实例状态
    const instance = await this.flowInstanceRepo.findOne({
      where: { id: task.instanceId },
    });
    instance.status = 'rejected';
    instance.endTime = new Date();
    await this.flowInstanceRepo.save(instance);

    // 更新业务状态
    if (instance.businessType === 'loan_application') {
      await this.loanAppRepo.update(
        { id: instance.businessId },
        { status: 'rejected' }
      );
    }

    return task;
  }

  /**
   * 获取任务详情
   */
  async getTaskDetail(taskId: number) {
    const task = await this.flowTaskRepo.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    const instance = await this.flowInstanceRepo.findOne({
      where: { id: task.instanceId },
    });

    let businessData = null;
    if (instance && instance.businessType === 'loan_application') {
      businessData = await this.loanAppRepo.findOne({
        where: { id: instance.businessId },
      });
    }

    const allTasks = await this.flowTaskRepo.find({
      where: { instanceId: task.instanceId },
      order: { createdAt: 'ASC' },
    });

    const nodes = await this.flowNodeRepo.find({
      where: { flowId: instance.flowId },
      order: { sortOrder: 'ASC' },
    });

    return {
      task,
      instance,
      businessData,
      allTasks,
      nodes,
    };
  }
}
