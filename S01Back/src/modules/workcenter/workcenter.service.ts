import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WorkCenterCategory } from '@/entities/work-center-category.entity';
import { SystemModule } from '@/entities/system-module.entity';
import { User } from '@/entities/user.entity';
import { WorkCenterClassResponse, ClassItem } from './dto/workcenter.dto';

/**
 * 角色对应的模块权限配置
 * student: 只有贷款管理 (H03)
 * auditor: 贷款管理 (H03) + 流程管理平台 (H04)
 * superAuditor: 全部模块
 */
const ROLE_MODULE_MAP: Record<string, string[]> = {
  student: ['H03'],
  auditor: ['H03', 'H04'],
  superAuditor: [], // 空数组表示可访问所有模块
};

/**
 * 工作中心服务
 * 业务逻辑与 Java 端 WorkCenterServiceImpl 一致
 */
@Injectable()
export class WorkcenterService {
  private readonly logger = new Logger(WorkcenterService.name);

  constructor(
    @InjectRepository(WorkCenterCategory)
    private readonly categoryRepository: Repository<WorkCenterCategory>,
    @InjectRepository(SystemModule)
    private readonly moduleRepository: Repository<SystemModule>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 获取工作中心分类列表
   * @returns 分类列表响应
   */
  async getCategories(): Promise<WorkCenterClassResponse> {
    const response: WorkCenterClassResponse = {
      code: 0,
      data: [],
      msg: '',
    };

    try {
      // 查询所有启用的分类
      const categories = await this.categoryRepository.find({
        where: { status: 1 },
        order: { sortOrder: 'ASC' },
      });

      // 转换为前端需要的格式
      const classItems: ClassItem[] = categories.map(category => ({
        id: category.categoryId,
        name: category.categoryName,
        icon: category.categoryIcon,
      }));

      response.code = 0;
      response.data = classItems;
      response.msg = '获取分类成功';
    } catch (e) {
      this.logger.error(`[WorkcenterService] 获取分类失败: ${e.message}`, e.stack);
      response.code = -1;
      response.data = [];
      response.msg = '获取分类失败: ' + e.message;
    }

    return response;
  }

  /**
   * 根据用户ID获取贷款角色
   */
  async getUserLoanRole(userId: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user?.loanRole || 'student';
  }

  /**
   * 根据分类名称获取模块列表
   * @param name 分类名称
   * @param userId 用户ID（可选，用于角色权限筛选）
   * @returns 模块列表
   */
  async getModulesByName(name?: string, userId?: number): Promise<SystemModule[]> {
    this.logger.log(`[WorkcenterService] 根据分类名称获取模块列表: name="${name}", userId=${userId}`);

    // 获取用户角色对应的模块权限
    let allowedModuleCodes: string[] | null = null;
    if (userId) {
      const loanRole = await this.getUserLoanRole(userId);
      this.logger.log(`[WorkcenterService] 用户角色: ${loanRole}`);
      const roleCodes = ROLE_MODULE_MAP[loanRole];
      // 如果角色配置的模块列表非空，则进行筛选
      if (roleCodes && roleCodes.length > 0) {
        allowedModuleCodes = roleCodes;
      }
    }

    // 使用 QueryBuilder 精确控制查询条件
    const queryBuilder = this.moduleRepository
      .createQueryBuilder('module')
      .where('module.status = :status', { status: 1 });

    // 只有当 name 存在且不为空时才按分类过滤
    if (name && name.trim() !== '') {
      queryBuilder.andWhere('module.category_name = :categoryName', { categoryName: name });
    }

    // 根据角色权限筛选模块
    if (allowedModuleCodes) {
      queryBuilder.andWhere('module.module_code IN (:...codes)', { codes: allowedModuleCodes });
    }

    queryBuilder.orderBy('module.id', 'ASC');

    const modules = await queryBuilder.getMany();

    this.logger.log(`[WorkcenterService] 查询到 ${modules.length} 个模块`);
    return modules;
  }
}
