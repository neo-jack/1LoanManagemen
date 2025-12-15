import { getToken, clearAuth } from '@/utils/auth';
import { navigateToMain } from '@/utils/navigate';
import { message } from 'antd';

/**
 * 请求配置
 */
export const request = {
  timeout: 30000,
  
  // 请求拦截器
  requestInterceptors: [
    (config: any) => {
      const token = getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],
  
  // 响应拦截器
  responseInterceptors: [
    (response: any) => {
      const { data } = response;
      
      // 业务错误处理
      if (data.code && data.code !== 200) {
        message.error(data.message || '请求失败');
      }
      
      return response;
    },
  ],
  
  // 错误处理
  errorConfig: {
    errorHandler: (error: any) => {
      const { response } = error;
      
      if (response?.status === 401) {
        message.error('登录已过期，请重新登录');
        clearAuth();
        navigateToMain();
        return;
      }
      
      if (response?.status === 403) {
        message.error('没有权限访问');
        return;
      }
      
      message.error('网络错误，请稍后重试');
    },
  },
};
