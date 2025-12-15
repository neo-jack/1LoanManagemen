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
  
  // 端口配置 - 使用环境变量 PORT=16002 npm run dev
  // 或者在 package.json 中设置 UMI_PORT

  layout: false,
  define: {
    MAIN_APP_URL: 'http://localhost:8000',
  },
  alias: {
    '@': require('path').resolve(__dirname, 'src'),
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/EmptyLayout',
      routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: './Login' },
      ],
    },
    {
      path: '/hr',
      component: '@/layouts/BasicLayout',
      routes: [
        { path: '/hr', redirect: '/hr/student/list' },
        // 学生管理
        { path: '/hr/student/list', component: './Student/List' },
        { path: '/hr/student/edit/:id', component: './Student/Edit' },
        // 审核员管理
        { path: '/hr/auditor/list', component: './Auditor/List' },
        { path: '/hr/auditor/edit/:id', component: './Auditor/Edit' },
        { path: '/hr/auditor/add', component: './Auditor/Edit' },
      ],
    },
    { path: '*', component: '@/components/404' },
  ],
  npmClient: 'npm',
});
