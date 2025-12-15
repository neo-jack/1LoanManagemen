import { getToken, getUser, clearAuth } from '@/utils/auth';
import { navigateToMain } from '@/utils/navigate';
import { message } from 'antd';

/**
 * qiankun 主应用配置
 */
export const qiankun = {
  // 传递给子应用的 props
  apps: [
    {
      name: 'flow-app',
      entry: 'http://localhost:16004',
      props: {
        getToken,
        getUser,
      },
    },
  ],
  
  // 子应用生命周期钩子（调试用）
  lifeCycles: {
    beforeLoad: [(app: any) => {
      console.log('[qiankun] beforeLoad - 准备加载子应用:', app.name);
      console.log('[qiankun] 子应用 entry:', app.entry);
      console.log('[qiankun] 当前路由:', window.location.pathname);
      return Promise.resolve();
    }],
    beforeMount: [(app: any) => {
      console.log('[qiankun] beforeMount - 准备挂载子应用:', app.name);
      console.log('[qiankun] 子应用容器:', app.container);
      return Promise.resolve();
    }],
    afterMount: [(app: any) => {
      console.log('[qiankun] afterMount - 子应用挂载完成:', app.name);
      return Promise.resolve();
    }],
    beforeUnmount: [(app: any) => {
      console.log('[qiankun] beforeUnmount - 准备卸载子应用:', app.name);
      return Promise.resolve();
    }],
    afterUnmount: [(app: any) => {
      console.log('[qiankun] afterUnmount - 子应用卸载完成:', app.name);
      return Promise.resolve();
    }],
  },

  // 子应用加载错误处理
  fetch: (url: string, options: any) => {
    console.log('[qiankun] fetch 请求:', url);
    return window.fetch(url, options).then((res) => {
      console.log('[qiankun] fetch 响应状态:', res.status, res.url);
      return res;
    }).catch((err) => {
      console.error('[qiankun] fetch 错误:', err);
      throw err;
    });
  },
};

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
