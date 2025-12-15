import { Controller, Get, Headers } from '@nestjs/common';
import { WorkCenterService } from './work-center.service';
import { ResultDto } from '@/common/dto/result.dto';
import { WorkCenterStatsDto, QuickEntryDto } from './dto/work-center.dto';
import { JwtUtil } from '@/common/utils/jwt.util';

/**
 * 工作中心控制器
 */
@Controller('api/work-center')
export class WorkCenterController {
  constructor(private readonly workCenterService: WorkCenterService) {}

  /**
   * 获取工作中心统计数据
   */
  @Get('stats')
  async getStats(@Headers('authorization') token?: string): Promise<ResultDto<WorkCenterStatsDto>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);
    
    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    const userId = JwtUtil.getUserIdFromToken(jwtToken);
    const stats = await this.workCenterService.getWorkCenterStats(userId);
    
    return ResultDto.success(stats, '获取工作中心统计数据成功');
  }

  /**
   * 获取快捷入口列表
   */
  @Get('quick-entries')
  async getQuickEntries(@Headers('authorization') token?: string): Promise<ResultDto<QuickEntryDto[]>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);
    
    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    const userId = JwtUtil.getUserIdFromToken(jwtToken);
    const entries = await this.workCenterService.getQuickEntries(userId);
    
    return ResultDto.success(entries, '获取快捷入口列表成功');
  }
}
