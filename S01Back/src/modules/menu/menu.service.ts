import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '@/entities/menu.entity';
import { MenuDto } from './dto/menu.dto';

/**
 * 菜单服务
 */
@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

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

    return menus.map(menu => this.toDto(menu));
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

    return menus.map(menu => this.toDto(menu));
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
