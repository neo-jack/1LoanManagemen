/**
 * 工作中心统计数据DTO
 */
export class WorkCenterStatsDto {
  /**
   * 待办事项数量
   */
  todoCount: number;

  /**
   * 待审批数量
   */
  approvalCount: number;

  /**
   * 消息通知数量
   */
  messageCount: number;

  /**
   * 最近访问数量
   */
  recentVisitCount: number;
}

/**
 * 工作中心快捷入口DTO
 */
export class QuickEntryDto {
  /**
   * 入口ID
   */
  id: number;

  /**
   * 入口名称
   */
  name: string;

  /**
   * 入口图标
   */
  icon: string;

  /**
   * 入口URL
   */
  url: string;

  /**
   * 排序
   */
  sort: number;
}
