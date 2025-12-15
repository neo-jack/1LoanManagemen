/**
 * 与 Java MenuItemDTO / 前端 MenuItem 对齐的菜单项 DTO
 */
export class MenuItemDto {
  /** 协同ID */
  SYNERGY_ID: string | null;

  /** 菜单编号 */
  MENU_NO: string;

  /** 子菜单列表 */
  SUB_MENU: MenuItemDto[];

  /** 菜单名称 */
  MENU_NAME: string;

  /** 菜单图标 */
  MENU_ICON: string | null;

  /** 菜单URL */
  MENU_URL: string | null;

  /** 系统菜单 */
  SYS_MENU: string | null;

  /** 父级代码 */
  PARENT_CODE: string;

  /** 菜单模块 */
  MENU_MODULE: string | null;

  /** 菜单排序 */
  MENU_SORT: string | null;

  /** 回调模块ID */
  BECALL_MODULE_ID: string | null;
}
