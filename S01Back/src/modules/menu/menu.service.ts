import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '@/entities/menu.entity';
import { MenuDto } from './dto/menu.dto';

/**
 * 菜单服务
 */
@Injectable()
export class MenuService implements OnModuleInit {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  /**
   * 模块初始化时检查并创建默认菜单
   */
  async onModuleInit() {
    await this.seedMenus();
  }

  /**
   * 初始化默认菜单
   */
  private async seedMenus() {
    const defaultMenus = [
      {
        menuNo: 'H5705',
        menuName: '工作中台',
        menuIcon: 'AppstoreOutlined',
        menuUrl: '/xt/workcenter',
        userId: 1,
        level: 1,
        menuSort: '1',
      },
      {
        menuNo: 'H5701',
        menuName: '工作看板',
        menuIcon: 'DashboardOutlined',
        menuUrl: '/xt/workboard',
        userId: 1,
        level: 1,
        menuSort: '2',
      },
    ];

    for (const menuData of defaultMenus) {
      // 检查 menuNo 是否存在
      const exists = await this.menuRepository.findOne({
        where: { menuNo: menuData.menuNo },
      });

      if (!exists) {
        const menu = this.menuRepository.create(menuData);
        await this.menuRepository.save(menu);
        this.logger.log(`[Seed] 默认菜单 ${menuData.menuName} (${menuData.menuUrl}) 创建成功`);
      } else if (exists.menuUrl !== menuData.menuUrl || exists.menuName !== menuData.menuName) {
        // 如果已存在但 URL 或名称不对，更新 URL 和名称
        exists.menuUrl = menuData.menuUrl;
        exists.menuName = menuData.menuName;
        await this.menuRepository.save(exists);
        this.logger.log(`[Seed] 默认菜单 ${menuData.menuName} URL 更新成功: ${menuData.menuUrl}`);
      }
    }
  }

  /**
   * 根据用户ID获取菜单列表
   */
  async getMenusByUserId(userId: number): Promise<MenuDto[]> {
    this.logger.log(`获取用户菜单 - 用户ID: ${userId}`);

    // 所有用户获取相同的菜单列表，不按 userId 筛选
    const menus = await this.menuRepository.find({
      order: {
        menuSort: 'ASC',
        id: 'ASC',
      },
    });

    return menus.map((menu) => this.toDto(menu));
  }

  /**
   * 获取所有菜单
   */
  async getAllMenus(): Promise<MenuDto[]> {
    this.logger.log('获取所有菜单');

    const menus = await this.menuRepository.find({
      order: {
        userId: 'ASC',
        menuSort: 'ASC',
        id: 'ASC',
      },
    });

    return menus.map((menu) => this.toDto(menu));
  }

  /**
   * 根据ID获取菜单
   */
  async getMenuById(id: number): Promise<MenuDto | null> {
    const menu = await this.menuRepository.findOne({
      where: { id },
    });

    return menu ? this.toDto(menu) : null;
  }

  /**
   * 转换实体为DTO
   */
  private toDto(menu: Menu): MenuDto {
    return {
      id: menu.id,
      userId: menu.userId,
      synergyId: menu.synergyId,
      menuNo: menu.menuNo,
      menuName: menu.menuName,
      menuIcon: menu.menuIcon,
      menuUrl: menu.menuUrl,
      sysMenu: menu.sysMenu,
      parentCode: menu.parentCode,
      menuModule: menu.menuModule,
      menuSort: menu.menuSort,
      becallModuleId: menu.becallModuleId,
      level: menu.level,
    };
  }
}
