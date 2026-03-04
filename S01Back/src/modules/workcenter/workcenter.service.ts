import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WorkCenterCategory } from '@/entities/work-center-category.entity';
import { SystemModule } from '@/entities/system-module.entity';
import { User } from '@/entities/user.entity';
import { WorkCenterClassResponse, ClassItem } from './dto/workcenter.dto';

/**
 * 工作中心服务
 * 业务逻辑与 Java 端 WorkCenterServiceImpl 一致
 */
@Injectable()
export class WorkcenterService implements OnModuleInit {
  private readonly logger = new Logger(WorkcenterService.name);

  /**
   * 角色对应的模块权限配置
   */
  private readonly ROLE_MODULE_MAP: Record<string, string[]> = {
    student: ['H03'],
    auditor: ['H03', 'H04'],
    superAuditor: [], // 空数组表示可访问所有模块
  };

  constructor(
    @InjectRepository(WorkCenterCategory)
    private readonly categoryRepository: Repository<WorkCenterCategory>,
    @InjectRepository(SystemModule)
    private readonly moduleRepository: Repository<SystemModule>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 模块初始化时检查并创建默认分类和模块
   */
  async onModuleInit() {
    await this.seedWorkCenterData();
  }

  /**
   * 初始化工作中心数据
   */
  private async seedWorkCenterData() {
    // 1. 初始化分类
    const defaultCategories = [
      {
        categoryId: '1',
        categoryName: '主体业务',
        categoryIcon: 'AppstoreOutlined',
        sortOrder: 1,
        status: 1,
      },
    ];

    for (const cat of defaultCategories) {
      const exists = await this.categoryRepository.findOne({
        where: { categoryName: cat.categoryName },
      });
      if (!exists) {
        await this.categoryRepository.save(this.categoryRepository.create(cat));
        this.logger.log(`[Seed] 工作中心分类 ${cat.categoryName} 创建成功`);
      }
    }

    // 2. 初始化模块
    const defaultModules = [
      {
        moduleCode: 'H02',
        moduleName: '人事管理',
        description: '人事管理',
        icon: 'FileSearchOutlined',
        port: 3001,
        url: 'http://localhost:16002',
        categoryName: '主体业务',
        status: 1,
      },
      {
        moduleCode: 'H03',
        moduleName: '贷款管理',
        description: '贷款管理',
        icon: 'DollarOutlined',
        port: 3002,
        url: 'http://localhost:16003',
        categoryName: '主体业务',
        status: 1,
      },
      {
        moduleCode: 'H04',
        moduleName: '流程管理平台',
        description: '流程管理平台',
        icon: 'ShopOutlined',
        port: 3003,
        url: 'http://localhost:16004',
        categoryName: '主体业务',
        status: 1,
      },
    ];

    for (const mod of defaultModules) {
      const exists = await this.moduleRepository.findOne({
        where: { moduleCode: mod.moduleCode },
      });
      if (!exists) {
        await this.moduleRepository.save(this.moduleRepository.create(mod));
        this.logger.log(`[Seed] 系统模块 ${mod.moduleName} 创建成功`);
      }
    }
  }

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
      const classItems: ClassItem[] = categories.map((category) => ({
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
   * 根据分类名称获取模块列表 (已改为返回本地固定数据)
   * @param name 分类名称
   * @param userId 用户ID（可选，用于角色权限筛选）
   * @returns 模块列表
   */
  async getModulesByName(name?: string, userId?: number): Promise<SystemModule[]> {
    this.logger.log(`[WorkcenterService] getModulesByName 入参 (本地固定数据模式): name="${name}", userId=${userId}`);

    // 1. 定义本地固定模块数据
    const allFixedModules: SystemModule[] = [
      {
        id: 1,
        moduleCode: 'H02',
        moduleName: '人事管理',
        description: '主体业务',
        icon: 'FileSearchOutlined',
        port: 16002 ,
        url: '',
        categoryName: '主体业务',
        status: 1,
        createdAt: new Date('2025-09-15 16:36:40'),
        updatedAt: new Date(),
      },
      {
        id: 2,
        moduleCode: 'H03',
        moduleName: '贷款管理',
        description: '主体业务',
        icon: 'DollarOutlined',
        port: 16003,
        url: '',
        categoryName: '主体业务',
        status: 1,
        createdAt: new Date('2025-09-15 16:36:40'),
        updatedAt: new Date(),
      },
      {
        id: 3,
        moduleCode: 'H04',
        moduleName: '流程管理平台',
        description: '主体业务',
        icon: 'ShopOutlined',
        port: 16004,
        url: '',
        categoryName: '主体业务',
        status: 1,
        createdAt: new Date('2025-09-15 16:36:40'),
        updatedAt: new Date(),
      },
    ] as any[];

    // 2. 获取用户角色并过滤权限
    let allowedModules = [...allFixedModules];
    if (userId) {
      try {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const loanRole = user?.loanRole || 'student';
        this.logger.log(`[WorkcenterService] 用户 ${userId} 的角色为: ${loanRole}`);

        const roleCodes = this.ROLE_MODULE_MAP[loanRole];
        if (loanRole !== 'superAuditor') {
          const codes = roleCodes || [];
          allowedModules = allFixedModules.filter((m) => codes.includes(m.moduleCode));
        }
      } catch (err) {
        this.logger.error(`[WorkcenterService] 获取用户角色失败，默认显示学生权限: ${err.message}`);
        const studentCodes = this.ROLE_MODULE_MAP['student'];
        allowedModules = allFixedModules.filter((m) => studentCodes.includes(m.moduleCode));
      }
    }

    // 3. 根据名称简单过滤
    let result = allowedModules;
    if (name && name.trim() !== '') {
      const targetName = name.trim();
      // 如果传的是“主体业务”，则返回该分类下的
      result = allowedModules.filter((m) => m.categoryName.includes(targetName) || m.moduleName.includes(targetName));
    }

    this.logger.log(`[WorkcenterService] 返回固定数据数量: ${result.length}`);
    return result as SystemModule[];
  }
}
