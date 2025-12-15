# 高校学生助学贷款管理系统

## 项目简介

高校学生助学贷款管理系统是一个面向高校学生和管理人员的综合性管理平台，旨在提高助学贷款申请、审批、发放和管理的效率。系统采用前后端分离架构，提供友好的用户界面和强大的后台管理功能。

## 技术栈

### 前端技术 (H01Front)

- **框架**: React 18 + TypeScript
- **脚手架**: Umi Max 4.4.x
- **UI 组件库**: Ant Design 5.x + Ant Design Pro Components
- **图标**: Ant Design Icons + React Icons
- **工具库**: Day.js、Crypto-JS
- **代码规范**: Prettier + Husky

### 后端技术 (S01Back)

- **框架**: NestJS 10.x
- **数据库 ORM**: TypeORM 0.3.x
- **数据库**: MySQL 8.0
- **缓存**: Redis 4.x
- **身份认证**: Passport + JWT
- **加密**: BCrypt、Crypto-JS
- **文件上传**: Multer

## 项目结构

```
end-project/
├── H01Front/          # 前端项目
├── S01Back/           # 后端项目 (NestJS)
├── Data/              # 数据文件模型
├── Test/              # 测试与文档
└── README.md          # 项目说明
```

## 快速开始

### 前端项目

```bash
cd H01Front
npm install
npm run dev
```

### 后端项目

```bash
cd S01Back
npm install
npm run start:dev
```

## 功能模块

- **用户管理**: 学生、管理员多角色用户管理
- **贷款申请**: 在线申请、资料上传、流程跟踪
- **审批管理**: 多级审批、审批记录、状态管理


## 环境要求

- Node.js >= 16.x
- MySQL >= 8.0
- Redis >= 5.0

