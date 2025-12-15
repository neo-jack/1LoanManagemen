// 头像列表服务类型定义

// /api/user/getheadshotlist请求
export interface GetHeadshotListRequest {
  // 不再需要id字段，从token中解析用户ID
}


// /api/user/getheadshotlist响应
export interface GetHeadshotListResponse {
  code: number;
  data: HeadshotInfo[];
  msg: string;
}

// 头像信息 - 匹配后端UserAvatar实体
export interface HeadshotInfo {
  id: number;
  userId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  /** Base64编码的图片数据 */
  data: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}
