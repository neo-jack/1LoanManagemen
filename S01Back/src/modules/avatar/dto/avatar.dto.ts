/**
 * 头像上传响应DTO
 */
export class AvatarUploadResponseDto {
  /**
   * 头像URL
   */
  avatarUrl: string;

  /**
   * 文件名
   */
  fileName: string;

  /**
   * 文件大小（字节）
   */
  fileSize: number;
}
