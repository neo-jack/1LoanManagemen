// 令牌管理工具类
import { TOKEN_INFO } from '@/constants/token';
import { refreshToken } from '@/services/user/refresh';

// 令牌存储键名常量
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  EXPIRE_TIME: 'tokenExpireTime',
  USER_INFO: 'userInfo',
} as const;

// 令牌管理工具函数
export const TokenManager = {
  // 检查访问令牌是否过期
  isAccessTokenExpired: (): boolean => {
    const expireTime = sessionStorage.getItem(TOKEN_KEYS.EXPIRE_TIME);
    const now = Date.now();
    const expired = !expireTime || now >= Number(expireTime);

    console.log('[TokenManager] isAccessTokenExpired调用');
    console.log('[TokenManager] 过期时间存在:', !!expireTime);
    console.log('[TokenManager] 过期时间值:', expireTime);
    console.log('[TokenManager] 当前时间:', now);
    console.log('[TokenManager] 是否过期:', expired);

    return expired;
  },

  // 获取访问令牌
  getAccessToken: (): string | null => {
    const token = sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    console.log('[TokenManager] getAccessToken调用 - token存在:', !!token);
    console.log(
      '[TokenManager] getAccessToken调用 - token长度:',
      token ? token.length : 0,
    );
    return token;
  },

  // 获取刷新令牌
  getRefreshToken: (): string | null => {
    return sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  // 更新令牌信息
  updateTokens: (
    accessToken: string,
    expiresIn: number,
    refreshTokenValue?: string,
  ): void => {
    const expireTime = Date.now() + expiresIn * 1000;

    console.log('[TokenManager] 🔄 更新令牌信息');
    console.log('[TokenManager] accessToken长度:', accessToken.length);
    console.log('[TokenManager] expiresIn秒数:', expiresIn);
    console.log('[TokenManager] 新过期时间:', expireTime);
    console.log('[TokenManager] refreshToken存在:', !!refreshTokenValue);

    sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    sessionStorage.setItem(TOKEN_KEYS.EXPIRE_TIME, expireTime.toString());

    if (refreshTokenValue) {
      sessionStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshTokenValue);
    }

    console.log('[TokenManager] ✅ 令牌更新完成');
  },

  // 清除所有令牌
  clearTokens: (): void => {
    sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(TOKEN_KEYS.EXPIRE_TIME);
    sessionStorage.removeItem(TOKEN_KEYS.USER_INFO);
  },

  // 刷新访问令牌
  refreshAccessToken: async (): Promise<boolean> => {
    const refreshTokenValue = TokenManager.getRefreshToken();

    if (!refreshTokenValue) {
      return false;
    }

    try {
      const response = await refreshToken({ refreshToken: refreshTokenValue });

      if (response.code === 0 && response.data) {
        TokenManager.updateTokens(
          response.data.AccessToken,
          response.data.ExpiresIn,
          response.data.RefreshToken,
        );
        return true;
      } else {
        console.error('刷新令牌失败:', response.msg);
        return false;
      }
    } catch (error) {
      console.error('刷新令牌异常:', error);
      return false;
    }
  },

  // 检查令牌是否存在
  hasTokens: (): boolean => {
    const accessToken = TokenManager.getAccessToken();
    const refreshTokenValue = TokenManager.getRefreshToken();
    return !!(accessToken && refreshTokenValue);
  },

  // 检查令牌是否即将过期（提前5分钟警告）
  willExpireSoon: (): boolean => {
    const expireTime = sessionStorage.getItem(TOKEN_KEYS.EXPIRE_TIME);
    if (!expireTime) return true;

    const fiveMinutesInMs = 5 * 60 * 1000;
    return Date.now() + fiveMinutesInMs >= Number(expireTime);
  },

  // 获取令牌剩余有效时间（毫秒）
  getTimeToExpiry: (): number => {
    const expireTime = sessionStorage.getItem(TOKEN_KEYS.EXPIRE_TIME);
    if (!expireTime) return 0;

    const remaining = Number(expireTime) - Date.now();
    return Math.max(0, remaining);
  },

  // 获取默认令牌信息（从 constants）
  getDefaultTokenInfo: () => TOKEN_INFO,
};
