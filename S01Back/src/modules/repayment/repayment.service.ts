import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { RepaymentPlan } from '../../entities/repayment-plan.entity';
import { RepaymentSchedule } from '../../entities/repayment-schedule.entity';
import { LoanCollection } from '../../entities/loan-collection.entity';
import { LoanApplication } from '../../entities/loan-application.entity';
import { User } from '../../entities/user.entity';

/**
 * 还款与催收服务
 */
@Injectable()
export class RepaymentService {
  constructor(
    @InjectRepository(RepaymentPlan)
    private readonly planRepo: Repository<RepaymentPlan>,
    @InjectRepository(RepaymentSchedule)
    private readonly scheduleRepo: Repository<RepaymentSchedule>,
    @InjectRepository(LoanCollection)
    private readonly collectionRepo: Repository<LoanCollection>,
    @InjectRepository(LoanApplication)
    private readonly loanAppRepo: Repository<LoanApplication>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ==================== 还款计划 ====================

  /**
   * 为审批通过的贷款生成还款计划（等额本息）
   * @param applicationId - 贷款申请ID
   * @param totalPeriods - 总期数（月），默认12
   * @param interestRate - 年利率(%)，默认4.5
   */
  async generateRepaymentPlan(
    applicationId: number,
    totalPeriods = 12,
    interestRate = 4.5,
  ): Promise<RepaymentPlan> {
    const application = await this.loanAppRepo.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('贷款申请不存在');
    }

    // 检查是否已有还款计划
    const existing = await this.planRepo.findOne({
      where: { applicationId },
    });
    if (existing) {
      return existing;
    }

    const totalAmount = Number(application.amount);
    const monthlyRate = interestRate / 100 / 12;

    // 等额本息公式: M = P * r * (1+r)^n / ((1+r)^n - 1)
    let periodAmount: number;
    if (monthlyRate === 0) {
      periodAmount = totalAmount / totalPeriods;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalPeriods);
      periodAmount = totalAmount * monthlyRate * factor / (factor - 1);
    }
    periodAmount = Math.round(periodAmount * 100) / 100;

    // 还款开始日期：下个月1号
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startDateStr = startDate.toISOString().slice(0, 10);

    // 创建还款计划
    const plan = await this.planRepo.save({
      applicationId,
      userId: application.userId,
      totalAmount,
      interestRate,
      totalPeriods,
      periodAmount,
      startDate: startDateStr,
      status: 'active',
    });

    // 生成每期还款明细
    let remainingPrincipal = totalAmount;
    const schedules: Partial<RepaymentSchedule>[] = [];

    for (let i = 1; i <= totalPeriods; i++) {
      const interest = Math.round(remainingPrincipal * monthlyRate * 100) / 100;
      let principal: number;

      if (i === totalPeriods) {
        // 最后一期还清剩余本金
        principal = remainingPrincipal;
      } else {
        principal = Math.round((periodAmount - interest) * 100) / 100;
      }

      const amount = Math.round((principal + interest) * 100) / 100;
      remainingPrincipal = Math.round((remainingPrincipal - principal) * 100) / 100;

      // 计算到期日
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);

      schedules.push({
        planId: plan.id,
        periodNumber: i,
        dueDate: dueDate.toISOString().slice(0, 10),
        principal,
        interest,
        amount,
        status: 'pending',
      });
    }

    await this.scheduleRepo.save(schedules);
    return plan;
  }

  /**
   * 获取学生的还款计划列表
   */
  async getStudentPlans(userId: number) {
    const plans = await this.planRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // 附加贷款申请信息
    const result = [];
    for (const plan of plans) {
      const application = await this.loanAppRepo.findOne({
        where: { id: plan.applicationId },
      });
      result.push({ ...plan, application });
    }
    return result;
  }

  /**
   * 获取还款计划详情（含每期明细）
   */
  async getPlanDetail(planId: number) {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('还款计划不存在');
    }

    const schedules = await this.scheduleRepo.find({
      where: { planId },
      order: { periodNumber: 'ASC' },
    });

    const application = await this.loanAppRepo.findOne({
      where: { id: plan.applicationId },
    });

    return { plan, schedules, application };
  }

  /**
   * 在线还款（还某一期，需上传还款凭证）
   */
  async repay(
    userId: number,
    scheduleId: number,
    attachments?: Array<{ uid: string; name: string; fileName: string; url: string; type?: string }>,
  ) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
    });
    if (!schedule) {
      throw new NotFoundException('还款记录不存在');
    }

    const plan = await this.planRepo.findOne({ where: { id: schedule.planId } });
    if (!plan || Number(plan.userId) !== Number(userId)) {
      throw new BadRequestException('无权操作');
    }

    if (schedule.status === 'paid') {
      throw new BadRequestException('该期已还款');
    }

    if (!attachments || attachments.length === 0) {
      throw new BadRequestException('请上传还款凭证/发票');
    }

    // 更新还款明细
    schedule.status = 'paid';
    schedule.paidAmount = schedule.amount;
    schedule.paidDate = new Date();
    schedule.attachments = attachments;
    await this.scheduleRepo.save(schedule);

    // 更新还款计划统计
    plan.paidPeriods += 1;
    plan.paidAmount = Number(plan.paidAmount) + Number(schedule.amount);

    // 检查是否全部还清
    if (plan.paidPeriods >= plan.totalPeriods) {
      plan.status = 'completed';
    }
    await this.planRepo.save(plan);

    return schedule;
  }

  /**
   * 获取学生的还款提醒（未来7天内到期 + 已逾期未还）
   */
  async getRepaymentReminders(userId: number) {
    const plans = await this.planRepo.find({
      where: { userId, status: In(['active', 'overdue']) },
    });
    if (plans.length === 0) return [];

    const planIds = plans.map((p) => p.id);
    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // 即将到期（未来7天）
    const upcoming = await this.scheduleRepo
      .createQueryBuilder('s')
      .where('s.plan_id IN (:...planIds)', { planIds })
      .andWhere('s.status = :status', { status: 'pending' })
      .andWhere('s.due_date <= :sevenDaysLater', { sevenDaysLater })
      .andWhere('s.due_date >= :today', { today })
      .orderBy('s.due_date', 'ASC')
      .getMany();

    // 已逾期
    const overdue = await this.scheduleRepo
      .createQueryBuilder('s')
      .where('s.plan_id IN (:...planIds)', { planIds })
      .andWhere('s.status IN (:...statuses)', { statuses: ['pending', 'overdue'] })
      .andWhere('s.due_date < :today', { today })
      .orderBy('s.due_date', 'ASC')
      .getMany();

    // 标记逾期
    for (const item of overdue) {
      if (item.status === 'pending') {
        item.status = 'overdue';
        await this.scheduleRepo.save(item);
      }
    }

    return { upcoming, overdue };
  }

  // ==================== 统计分析（审核员） ====================

  /**
   * 获取贷款统计数据
   */
  async getStatistics() {
    // 贷款申请统计
    const totalApplications = await this.loanAppRepo.count();
    const approvedCount = await this.loanAppRepo.count({ where: { status: 'approved' } });
    const pendingCount = await this.loanAppRepo.count({ where: { status: In(['pending', 'auditing']) } });
    const rejectedCount = await this.loanAppRepo.count({ where: { status: 'rejected' } });

    // 金额统计
    const amountResult = await this.loanAppRepo
      .createQueryBuilder('app')
      .select('SUM(app.amount)', 'totalAmount')
      .where('app.status IN (:...statuses)', { statuses: ['approved', 'completed'] })
      .getRawOne();

    // 还款统计
    const totalPlans = await this.planRepo.count();
    const activePlans = await this.planRepo.count({ where: { status: 'active' } });
    const completedPlans = await this.planRepo.count({ where: { status: 'completed' } });

    const paidResult = await this.planRepo
      .createQueryBuilder('p')
      .select('SUM(p.paid_amount)', 'totalPaid')
      .getRawOne();

    // 逾期统计
    const today = new Date().toISOString().slice(0, 10);
    const overdueSchedules = await this.scheduleRepo
      .createQueryBuilder('s')
      .where('s.status IN (:...statuses)', { statuses: ['pending', 'overdue'] })
      .andWhere('s.due_date < :today', { today })
      .getCount();

    const overdueAmountResult = await this.scheduleRepo
      .createQueryBuilder('s')
      .select('SUM(s.amount)', 'overdueAmount')
      .where('s.status IN (:...statuses)', { statuses: ['pending', 'overdue'] })
      .andWhere('s.due_date < :today', { today })
      .getRawOne();

    return {
      applications: {
        total: totalApplications,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
      },
      amount: {
        totalLoan: Number(amountResult?.totalAmount) || 0,
        totalPaid: Number(paidResult?.totalPaid) || 0,
      },
      repayment: {
        totalPlans,
        activePlans,
        completedPlans,
      },
      overdue: {
        count: overdueSchedules,
        amount: Number(overdueAmountResult?.overdueAmount) || 0,
      },
    };
  }

  /**
   * 获取逾期贷款列表（审核员用）
   */
  async getOverdueList() {
    const today = new Date().toISOString().slice(0, 10);

    const overdueSchedules = await this.scheduleRepo
      .createQueryBuilder('s')
      .where('s.status IN (:...statuses)', { statuses: ['pending', 'overdue'] })
      .andWhere('s.due_date < :today', { today })
      .orderBy('s.due_date', 'ASC')
      .getMany();

    // 标记逾期 + 附加用户和贷款信息
    const result = [];
    for (const schedule of overdueSchedules) {
      if (schedule.status === 'pending') {
        schedule.status = 'overdue';
        await this.scheduleRepo.save(schedule);
      }

      const plan = await this.planRepo.findOne({ where: { id: schedule.planId } });
      const application = await this.loanAppRepo.findOne({
        where: { id: plan?.applicationId },
      });
      const user = await this.userRepo.findOne({ where: { id: plan?.userId } });

      result.push({
        schedule,
        plan,
        application,
        user: user ? { id: user.id, username: user.username, realName: (user as any).realName } : null,
      });
    }

    return result;
  }

  // ==================== 催收管理 ====================

  /**
   * 添加催收记录
   */
  async addCollection(collectorId: number, data: Partial<LoanCollection>) {
    const record = this.collectionRepo.create({
      ...data,
      collectorId,
    });
    return this.collectionRepo.save(record);
  }

  /**
   * 获取催收记录列表
   */
  async getCollections(applicationId?: number) {
    const where: any = {};
    if (applicationId) {
      where.applicationId = applicationId;
    }

    const records = await this.collectionRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    // 附加用户信息
    const result = [];
    for (const record of records) {
      const user = await this.userRepo.findOne({ where: { id: record.userId } });
      const collector = await this.userRepo.findOne({ where: { id: record.collectorId } });
      result.push({
        ...record,
        userName: user ? (user as any).realName || user.username : '-',
        collectorName: collector ? (collector as any).realName || collector.username : '-',
      });
    }
    return result;
  }
}
