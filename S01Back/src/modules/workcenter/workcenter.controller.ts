import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { WorkcenterService } from './workcenter.service';
import { ResultDto } from '@/common/dto/result.dto';
import { WorkCenterClassResponse, GetModuleListRequest } from './dto/workcenter.dto';
import { SystemModule } from '@/entities/system-module.entity';
import { JwtUtil } from '@/common/utils/jwt.util';

/**
 * 工作中心控制器
 * 接口路径和响应格式与 Java 端 WorkCenterController 完全一致
 * 注意：路径是 /api/workcenter 而不是 /api/work-center
 */
@Controller('api/workcenter')
export class WorkcenterController {
  constructor(private readonly workcenterService: WorkcenterService) {}

  /**
   * 获取工作中心分类列表
   * GET /api/workcenter/getclass
   * 注意：返回的是 WorkCenterClassResponse，不是包装在 ResultDto 里的
   */
  @Get('getclass')
  async getWorkCenterClass(): Promise<WorkCenterClassResponse> {
    return this.workcenterService.getCategories();
  }

  /**
   * 根据分类名称获取模块列表
   * POST /api/workcenter/getmodulelist
   * 根据用户角色筛选可访问的模块
   */
  @Post('getmodulelist')
  async getModuleList(
    @Body() request: GetModuleListRequest,
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<SystemModule[]>> {
    console.log('[WorkcenterController] getModuleList 接收到请求:', JSON.stringify(request));
    const name = request?.name;
    console.log('[WorkcenterController] 解析到 name:', name);

    // 从 token 获取用户ID用于角色权限筛选
    let userId: number | undefined;
    if (token && token.startsWith('Bearer ')) {
      const jwtToken = token.substring(7);
      if (JwtUtil.validateToken(jwtToken)) {
        userId = JwtUtil.getUserIdFromToken(jwtToken) || undefined;
      }
    }
    console.log('[WorkcenterController] 用户ID:', userId);

    const modules = await this.workcenterService.getModulesByName(name, userId);
    console.log('[WorkcenterController] 查询到模块数量:', modules.length);
    return ResultDto.success(modules, '获取模块列表成功');
  }
}
