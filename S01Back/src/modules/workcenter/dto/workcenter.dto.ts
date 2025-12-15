import { IsString, IsOptional } from 'class-validator';

/**
 * 分类项数据
 * 对应 Java 端 WorkCenterClassResponse.ClassItem
 */
export class ClassItem {
  /**
   * 分类ID
   */
  id: string;

  /**
   * 分类名称
   */
  name: string;

  /**
   * 分类图标
   */
  icon: string;
}

/**
 * 工作中心分类列表响应DTO
 * 对应 Java 端 WorkCenterClassResponse
 * 注意：这个响应不是包装在 ResultDto 里的，而是直接返回
 */
export class WorkCenterClassResponse {
  /**
   * 响应码：0-成功，其他-失败
   */
  code: number;

  /**
   * 分类列表数据
   */
  data: ClassItem[];

  /**
   * 响应消息
   */
  msg: string;
}

/**
 * 获取模块列表请求
 */
export class GetModuleListRequest {
  /**
   * 分类名称
   */
  @IsString()
  @IsOptional()
  name?: string;
}
