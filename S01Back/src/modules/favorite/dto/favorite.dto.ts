/**
 * 收藏模块DTO
 * 对应 Java 端 FavoriteDTO，字段完全一致
 */
export class FavoriteDTO {
  /**
   * 模块ID
   */
  id: string;

  /**
   * 模块名称
   */
  name: string;

  /**
   * 模块描述
   */
  description: string;

  /**
   * 图标
   */
  icon: string;

  /**
   * 端口
   */
  port: number;

  /**
   * 访问URL
   */
  url: string;

  /**
   * 排序序号
   */
  sort: number;
}

/**
 * 添加收藏请求DTO
 * 对应 Java 端 FavoriteAddRequest
 */
export class FavoriteAddRequest {
  /**
   * 模块ID
   */
  id: string;

  /**
   * 模块名称
   */
  name: string;

  /**
   * 模块描述
   */
  description: string;

  /**
   * 图标
   */
  icon: string;

  /**
   * 端口
   */
  port: number;

  /**
   * 访问URL
   */
  url: string;
}

/**
 * 移除收藏请求DTO
 * 对应 Java 端 FavoriteRemoveRequest
 */
export class FavoriteRemoveRequest {
  /**
   * 模块ID
   */
  id: string;
}

/**
 * 收藏排序项
 */
export class SortItem {
  /**
   * 模块ID
   */
  id: string;

  /**
   * 排序序号
   */
  sort: number;
}

/**
 * 收藏排序请求DTO
 * 对应 Java 端 FavoriteSortRequest
 */
export class FavoriteSortRequest {
  /**
   * 排序项目列表
   */
  sortItems: SortItem[];
}
