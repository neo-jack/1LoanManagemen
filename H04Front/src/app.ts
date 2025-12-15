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

/**
 * qiankun 子应用生命周期钩子
 */
export const qiankun = {
  async mount(props: any) {
    console.log('=== F04Front 子应用 mount 开始 ===');
    console.log('[F04 mount] props:', props);
    console.log('[F04 mount] 主应用传入的 base:', props?.base);
    console.log('[F04 mount] 主应用传入的 name:', props?.name);
    console.log('[F04 mount] window.location:', {
      pathname: window.location.pathname,
      href: window.location.href,
      origin: window.location.origin,
    });
    console.log('[F04 mount] 是否在 qiankun 环境:', (window as any).__POWERED_BY_QIANKUN__);
    // 从主应用获取 token 和用户信息并存储到本地
    if (props?.getToken) {
      const token = props.getToken();
      console.log('[F04 Debug] 从主应用获取 token:', token ? '有效' : '无');
      if (token) {
        localStorage.setItem('accessToken', token);
      }
    } else {
      console.log('[F04 Debug] 主应用未提供 getToken 方法');
    }
    if (props?.getUser) {
      const user = props.getUser();
      console.log('[F04 Debug] 从主应用获取 user:', user);
      if (user) {
        localStorage.setItem('userInfo', JSON.stringify(user));
      }
    }
    console.log('F04Front 已同步主应用的认证信息');
  },
  async bootstrap() {
    console.log('F04Front 子应用 bootstrap');
  },
  async unmount() {
    console.log('F04Front 子应用 unmount');
  },
};
