import { Controller, Post, Headers } from '@nestjs/common';
import { ResultDto } from '@/common/dto/result.dto';
import { JwtUtil } from '@/common/utils/jwt.util';
import { MenuService } from './menu.service';
import { MenuDto } from './dto/menu.dto';
import { MenuItemDto } from './dto/menu-item.dto';

/**
 * 兼容 Java 版 /api/user/getmues 的用户菜单控制器
 */
@Controller('api/user')
export class UserMenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * 获取当前用户菜单（树形结构）
   */
  @Post('getmues')
  async getMenus(@Headers('authorization') token?: string): Promise<ResultDto<MenuItemDto[]>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('缺少授权token');
    }

    const jwtToken = token.substring(7);

    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('token已过期，请重新登录');
    }

    const userId = JwtUtil.getUserIdFromToken(jwtToken);
    if (!userId || userId <= 0) {
      return ResultDto.fail('无效的用户token');
    }

    const flatMenus = await this.menuService.getMenusByUserId(userId);

    if (!flatMenus || flatMenus.length === 0) {
      return ResultDto.success<MenuItemDto[]>([], '用户暂无可用菜单');
    }

    const hierarchicalMenus = this.buildHierarchicalMenus(flatMenus);

    return ResultDto.success(hierarchicalMenus, '获取菜单成功');
  }

  /**
   * 构建层级菜单树
   */
  private buildHierarchicalMenus(flatMenus: MenuDto[]): MenuItemDto[] {
    const menuMap = new Map<string, MenuDto>();
    flatMenus.forEach(menu => {
      menuMap.set(menu.menuNo, menu);
    });

    const rootMenus: MenuItemDto[] = [];
    const processed = new Set<string>();

    for (const menu of flatMenus) {
      if (this.isRootMenu(menu) && !processed.has(menu.menuNo)) {
        const rootMenu = this.buildMenuTree(menu, menuMap, processed);
        rootMenus.push(rootMenu);
      }
    }

    // 根菜单排序，null 排在最后
    rootMenus.sort((a, b) => this.compareMenuSort(a.MENU_SORT, b.MENU_SORT));

    return rootMenus;
  }

  /**
   * 判断是否为根菜单
   */
  private isRootMenu(menu: MenuDto): boolean {
    const parentCode = menu.parentCode;
    const sysMenu = menu.sysMenu;
    return !!parentCode && parentCode === sysMenu;
  }

  /**
   * 递归构建菜单树
   */
  private buildMenuTree(
    currentMenu: MenuDto,
    menuMap: Map<string, MenuDto>,
    processed: Set<string>,
  ): MenuItemDto {
    processed.add(currentMenu.menuNo);

    const dto = this.convertToMenuItemDto(currentMenu);
    const subMenus: MenuItemDto[] = [];

    for (const menu of menuMap.values()) {
      if (!processed.has(menu.menuNo) && menu.parentCode === currentMenu.menuNo) {
        const child = this.buildMenuTree(menu, menuMap, processed);
        subMenus.push(child);
      }
    }

    // 子菜单排序
    subMenus.sort((a, b) => this.compareMenuSort(a.MENU_SORT, b.MENU_SORT));

    dto.SUB_MENU = subMenus;
    return dto;
  }

  /**
   * 将 MenuDto 转换为前端/Java 兼容的 MenuItemDto
   */
  private convertToMenuItemDto(menu: MenuDto): MenuItemDto {
    return {
      SYNERGY_ID: menu.synergyId != null ? String(menu.synergyId) : null,
      MENU_NO: menu.menuNo,
      SUB_MENU: [],
      MENU_NAME: menu.menuName,
      MENU_ICON: menu.menuIcon ?? null,
      MENU_URL: menu.menuUrl ?? null,
      SYS_MENU: menu.sysMenu ?? null,
      PARENT_CODE: menu.parentCode ?? '',
      MENU_MODULE: menu.menuModule ?? null,
      MENU_SORT: menu.menuSort ?? null,
      BECALL_MODULE_ID: menu.becallModuleId != null ? String(menu.becallModuleId) : null,
    };
  }

  /**
   * 菜单排序比较函数（nullsLast）
   */
  private compareMenuSort(a: string | null | undefined, b: string | null | undefined): number {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
  }
}
