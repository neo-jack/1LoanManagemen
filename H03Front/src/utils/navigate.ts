/**
 * 应用跳转工具
 */
const APP_URLS = {
  main: 'http://localhost:3000',     // H01Front
  hr: 'http://localhost:16002',      // H02Front
  loan: 'http://localhost:16003',    // H03Front
  flow: 'http://localhost:16004',    // F04Front
};

/**
 * 跳转到指定应用
 */
export const navigateToApp = (app: keyof typeof APP_URLS, path = '/') => {
  window.location.href = `${APP_URLS[app]}${path}`;
};

/**
 * 跳转到登录页
 */
export const navigateToLogin = () => {
  window.location.href = `${APP_URLS.main}/login`;
};

/**
 * 返回主应用
 */
export const navigateToMain = () => {
  window.location.href = APP_URLS.main;
};
