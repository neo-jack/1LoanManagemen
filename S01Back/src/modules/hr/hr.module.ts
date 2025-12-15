import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';
import { User } from '../../entities/user.entity';

/**
 * 人事模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
