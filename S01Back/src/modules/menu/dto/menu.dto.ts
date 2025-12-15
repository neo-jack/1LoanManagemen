/**
 * 菜单响应DTO
 */
export class MenuDto {
  /**
   * 菜单ID
   */
  id: number;

  /**
   * 用户ID
   */
  userId: number;

  /**
   * 协同ID
   */
  synergyId?: number;

  /**
   * 菜单编号
   */
  menuNo: string;

  /**
   * 菜单名称
   */
  menuName: string;

  /**
   * 菜单图标
   */
  menuIcon?: string;

  /**
   * 菜单URL
   */
  menuUrl?: string;

  /**
   * 系统菜单
   */
  sysMenu?: string;

  /**
   * 父级代码
   */
  parentCode?: string;

  /**
   * 菜单模块
   */
  menuModule?: string;

  /**
   * 菜单排序
   */
  menuSort?: string;

  /**
   * 回调模块ID
   */
  becallModuleId?: number;

  /**
   * 菜单层级
   */
  level: number;
}
