import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { Notice } from '../../entities/notice.entity';
import { NoticeRead } from '../../entities/notice-read.entity';
import { User } from '../../entities/user.entity';

/**
 * 通知模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Notice, NoticeRead, User])],
  controllers: [NoticeController],
  providers: [NoticeService],
  exports: [NoticeService],
})
export class NoticeModule {}
