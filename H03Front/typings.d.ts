/**
 * 全局类型声明
 */

// Less 模块声明
declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

// 图片资源声明
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

// 环境变量声明
declare const MAIN_APP_URL: string;
