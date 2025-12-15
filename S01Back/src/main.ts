import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 配置 body parser 大小限制（支持大 base64 图片上传，限制 10MB）
  // 使用 NestJS 内置的方式配置
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { limit: '10mb', extended: true });
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // 启用CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // 配置静态文件服务（用于头像访问）
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
  
  console.log(`UMI System Backend is running on port ${port}`);
  console.log(`Static files served from /uploads/`);
}

bootstrap();
