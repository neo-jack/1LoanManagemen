// 服务模块统一导出文件

// 用户相关服务
export * from './user/login';
export * from './user/logout';
export * from './user/refresh';
export * from './user/getheadshotlist';
export * from './user/avatorupload';
export * from './user/getmues';

// 密码相关服务（解决isMD5Format重复导出问题）
export { setPassword, hashPassword } from './user/setpassword';

// 系统相关服务
export * from './system/info';

// 收藏相关服务（新的API结构）
export { getFavoriteList, type FavoriteItem, type GetFavoriteListResult } from './favorite/get';
export { addFavorite, type AddFavoriteResult } from './favorite/add';
export { removeFavorite, type RemoveFavoriteResult } from './favorite/remove';

// 为了向后兼容，保留一些旧的导出（如果其他地方还在使用）
// 这些可以在确认没有其他地方使用后移除
export type { FavoriteItem as FavoriteModule } from './favorite/get';

// 为了保持向后兼容，提供一些别名导出
export { login } from './user/login';
export { logout } from './user/logout';
export { refreshToken } from './user/refresh';
export { getSystemInfo } from './system/info';
export { uploadAvatar } from './user/avatorupload';
export { getMenus } from './user/getmues';

// 通知相关服务
export {
  getNoticeList,
  getNoticeDetail,
  markNoticeAsRead,
  markAllNoticeAsRead,
  getUnreadCount,
} from './notice';
export type {
  NoticeType,
  TargetType,
  NoticeItem,
  GetNoticeListParams,
} from './notice';
