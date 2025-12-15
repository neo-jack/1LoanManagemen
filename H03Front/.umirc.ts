import { defineConfig } from "@umijs/max";

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {
    dataField: "",
  },
  mock: false,

  // 禁用浏览器自动翻译
  metas: [{ name: "google", content: "notranslate" }],
  headScripts: [
    { content: 'document.documentElement.setAttribute("translate", "no");' },
  ],

  // 代理到后端服务
  proxy: {
    "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
    },
  },

  // 端口配置 - 使用环境变量 PORT=16003 npm run dev
  // 或者在 package.json 中设置 UMI_PORT

  // qiankun 主应用配置
  qiankun: {
    master: {
      apps: [
        {
          name: "flow-app",
          entry: "http://localhost:16004",
        },
      ],
    },
  },

  layout: false,
  define: {
    MAIN_APP_URL: "http://localhost:8000",
  },
  alias: {
    "@": require("path").resolve(__dirname, "src"),
  },
  routes: [
    {
      path: "/",
      component: "@/layouts/EmptyLayout",
      routes: [
        { path: "/", redirect: "/login" },
        { path: "/login", component: "./Login" },
      ],
    },
    {
      path: "/loan",
      component: "@/layouts/BasicLayout",
      routes: [
        { path: "/loan", redirect: "/loan/apply/list" },
        // 学生申请功能
        { path: "/loan/apply/list", component: "./Apply/List" },
        { path: "/loan/apply/form", component: "./Apply/Form" },
        { path: "/loan/apply/detail/:id", component: "./Apply/Detail" },
        // 审核功能
        { path: "/loan/audit/list", component: "./Audit/List" },
        { path: "/loan/audit/detail/:id", component: "./Audit/Detail" },
        // 表单设置 (总审核)
        { path: "/loan/form-config", component: "./FormConfig" },
        // 流程设置 (组件级嵌入 F04)
        { path: "/loan/flow-config", component: "./FlowConfig" },
        // 人事管理 (总审核) - TODO: 待开发，暂时注释
        // { path: "/loan/hr/student", component: "./HR/StudentList" },
        // { path: "/loan/hr/auditor", component: "./HR/AuditorList" },
      ],
    },
    // 流程审核 (qiankun 嵌入 F04) - 独立顶层路由
    {
      path: "/flow",
      component: "@/layouts/BasicLayout",
      routes: [{ path: "/flow/*", microApp: "flow-app" }],
    },
    { path: "*", component: "@/components/404" },
  ],
  npmClient: "npm",
});
