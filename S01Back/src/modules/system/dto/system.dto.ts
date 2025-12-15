/**
 * 系统信息响应DTO
 */
export class SystemInfoDto {
  /**
   * 系统信息ID
   */
  id: number;

  /**
   * 客户端IP
   */
  clientIp?: string;

  /**
   * 服务器域名
   */
  serverDomain?: string;

  /**
   * 版本号
   */
  version?: string;

  /**
   * 主版本号
   */
  majorVersion: number;
}
