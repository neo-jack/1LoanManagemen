import { Injectable, Logger } from '@nestjs/common';
import { WorkCenterStatsDto, QuickEntryDto } from './dto/work-center.dto';

/**
 * 工作中心服务
 */
@Injectable()
export class WorkCenterService {
  private readonly logger = new Logger(WorkCenterService.name);

  /**
   * 获取工作中心统计数据
   */
  async getWorkCenterStats(userId: number): Promise<WorkCenterStatsDto> {
    this.logger.log(`获取工作中心统计数据 - 用户ID: ${userId}`);
    
    // 这里暂时返回模拟数据，实际应该从数据库查询
    return {
      todoCount: 0,
      approvalCount: 0,
      messageCount: 0,
      recentVisitCount: 0,
    };
  }

  /**
   * 获取快捷入口列表
   */
  async getQuickEntries(userId: number): Promise<QuickEntryDto[]> {
    this.logger.log(`获取快捷入口列表 - 用户ID: ${userId}`);
    
    // 这里暂时返回模拟数据，实际应该从数据库或配置文件读取
    return [
      {
        id: 1,
        name: '工作看板',
        icon: 'DashboardOutlined',
        url: '/xt/workboard',
        sort: 1,
      },
      {
        id: 2,
        name: '工作中台',
        icon: 'AppstoreOutlined',
        url: '/xt/workcenter',
        sort: 2,
      },
      {
        id: 3,
        name: '即时通讯',
        icon: 'MessageOutlined',
        url: '/xt/im',
        sort: 3,
      },
    ];
  }
}
