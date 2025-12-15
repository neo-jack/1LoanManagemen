import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {
    dataField: '',
  },
  mock: false,
  
  // 代理到后端服务
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
  
  // 端口配置 - 使用环境变量 PORT=16004 npm run dev
  // 或者在 package.json 中设置 UMI_PORT

  // 开发服务器配置 - 允许跨域访问（qiankun 必须）
  headScripts: [
    // 解决 qiankun 子应用 publicPath 问题
    { src: '', content: `window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || '/';` },
  ],

  // qiankun 子应用配置
  qiankun: {
    slave: {},
  },

  // 独立运行时使用 / 作为 base
  // 被嵌入时 qiankun 会自动处理路由
  base: '/',
  layout: false,
  define: {
    MAIN_APP_URL: 'http://localhost:8000',
  },
  alias: {
    '@': require('path').resolve(__dirname, 'src'),
  },
  routes: [
    // 被 H03 嵌入时的路由（无布局，避免双侧边栏）
    {
      path: '/loan',
      component: '@/layouts/EmptyLayout',
      routes: [
        { path: '/loan/flow-config', component: './FlowConfig' },
        { path: '/loan/flow-config/*', component: './FlowConfig' },
      ],
    },
    // 独立访问 /flow/* 路由（直接访问 localhost:16004）
    {
      path: '/flow',
      component: '@/layouts/EmptyLayout',
      routes: [
        { path: '/flow/config', component: './FlowConfig' },
        { path: '/flow/audit/todo', component: './FlowAudit/Todo' },
        { path: '/flow/audit/done', component: './FlowAudit/Done' },
        { path: '/flow/audit/copied', component: './FlowAudit/Copied' },
        { path: '/flow/audit/detail/:id', component: './FlowAudit/Detail' },
      ],
    },
    // 被嵌入时的路由（qiankun base=/flow，内部路径不带 /flow 前缀）
    {
      path: '/',
      component: '@/layouts/EmptyLayout',
      routes: [
        { path: '/config', component: './FlowConfig' },
        { path: '/audit/todo', component: './FlowAudit/Todo' },
        { path: '/audit/done', component: './FlowAudit/Done' },
        { path: '/audit/copied', component: './FlowAudit/Copied' },
        { path: '/audit/detail/:id', component: './FlowAudit/Detail' },
        // 独立运行时的登录
        { path: '/login', component: './Login' },
        { path: '/', redirect: '/login' },
      ],
    },
    { path: '*', component: '@/components/404' },
  ],
  npmClient: 'npm',
});
