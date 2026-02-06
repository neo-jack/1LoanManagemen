# S01Back NestJS Backend Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制编译后的代码
COPY dist/ ./dist/

# 创建uploads目录（如果不存在）
RUN mkdir -p ./uploads

# 复制环境配置文件
COPY .env-s01back ./.env

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main.js"]
