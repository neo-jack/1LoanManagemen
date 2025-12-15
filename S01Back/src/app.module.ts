import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MenuModule } from './modules/menu/menu.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { SystemModule } from './modules/system/system.module';
import { WorkCenterModule } from './modules/work-center/work-center.module';
import { WorkcenterModule } from './modules/workcenter/workcenter.module';
import { AvatarModule } from './modules/avatar/avatar.module';
// 贷款审批系统模块
import { LoanModule } from './modules/loan/loan.module';
import { FlowModule } from './modules/flow/flow.module';
import { HrModule } from './modules/hr/hr.module';
import { NoticeModule } from './modules/notice/notice.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 数据库模块
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'h01',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // 生产环境应设为false
      logging: process.env.NODE_ENV !== 'production',
    }),
    
    // 业务模块
    AuthModule,
    UserModule,
    MenuModule,
    FavoriteModule,
    SystemModule,
    WorkCenterModule,
    WorkcenterModule, // 兼容 Java 端 /api/workcenter 路径
    AvatarModule,
    // 贷款审批系统模块
    LoanModule,
    FlowModule,
    HrModule,
    NoticeModule,
  ],
})
export class AppModule {}
