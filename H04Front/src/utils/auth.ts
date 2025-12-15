/**
 * 认证工具类
 * 用于管理用户登录状态和 Token
 * 与 H01Front 主应用保持一致的存储方式
 */

// 存储键名 - 与 H01Front 保持一致
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRE_TIME_KEY = 'tokenExpireTime';
const USER_KEY = 'userInfo';

/**
 * 用户信息接口
 */
export interface UserInfo {
  USER_ID: number;
  USER_NAME: string;
  USER_AVATAR: string;
  USER_ROLE: string;
  HOSPITAL_CNAME: string;
  HOSPITAL_ID: number;
  LOAN_ROLE: string; // 贷款系统角色: student, auditor, superAuditor
}

/**
 * 存储登录信息
 */
export const setAuth = (token: string, user: UserInfo) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * 获取Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 获取用户信息
 */
export const getUser = (): UserInfo | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * 清除登录信息
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * 检查是否登录
 */
export const isLoggedIn = (): boolean => {
  return !!getToken();
};

/**
 * 检查是否有权限访问人事模块（仅总审核）
 */
export const hasHrAccess = (): boolean => {
  const user = getUser();
  return user?.LOAN_ROLE === 'superAuditor';
};
