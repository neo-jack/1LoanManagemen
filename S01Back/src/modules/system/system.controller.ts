import { Controller, Get, Headers } from '@nestjs/common';
import { SystemService } from './system.service';
import { ResultDto } from '@/common/dto/result.dto';
import { SystemInfoDto } from './dto/system.dto';
import { JwtUtil } from '@/common/utils/jwt.util';

/**
 * 系统信息控制器
 */
@Controller('api/system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  /**
   * 获取系统信息
   */
  @Get('info')
  async getSystemInfo(@Headers('authorization') token?: string): Promise<ResultDto<SystemInfoDto>> {
    // 系统信息可以不需要登录即可访问，根据实际需求调整
    const systemInfo = await this.systemService.getSystemInfo();
    
    if (!systemInfo) {
      return ResultDto.fail('系统信息不存在');
    }
    
    return ResultDto.success(systemInfo, '获取系统信息成功');
  }

  /**
   * 获取所有系统信息列表（管理员功能）
   */
  @Get('list')
  async getAllSystemInfo(@Headers('authorization') token?: string): Promise<ResultDto<SystemInfoDto[]>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);
    
    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    const systemInfoList = await this.systemService.getAllSystemInfo();
    
    return ResultDto.success(systemInfoList, '获取系统信息列表成功');
  }
}
