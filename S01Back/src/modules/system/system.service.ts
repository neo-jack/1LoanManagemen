import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemInfo } from '@/entities/system-info.entity';
import { SystemInfoDto } from './dto/system.dto';

/**
 * 系统信息服务
 */
@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(
    @InjectRepository(SystemInfo)
    private readonly systemInfoRepository: Repository<SystemInfo>,
  ) {}

  /**
   * 获取系统信息
   */
  async getSystemInfo(): Promise<SystemInfoDto | null> {
    this.logger.log('获取系统信息');
    
    const systemInfo = await this.systemInfoRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    return systemInfo ? this.toDto(systemInfo) : null;
  }

  /**
   * 获取所有系统信息列表
   */
  async getAllSystemInfo(): Promise<SystemInfoDto[]> {
    this.logger.log('获取所有系统信息');
    
    const systemInfoList = await this.systemInfoRepository.find({
      order: { id: 'DESC' },
    });

    return systemInfoList.map(info => this.toDto(info));
  }

  /**
   * 转换实体为DTO
   */
  private toDto(systemInfo: SystemInfo): SystemInfoDto {
    return {
      id: systemInfo.id,
      clientIp: systemInfo.clientIp,
      serverDomain: systemInfo.serverDomain,
      version: systemInfo.version,
      majorVersion: systemInfo.majorVersion,
    };
  }
}
