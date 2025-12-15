import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AvatarService],
  controllers: [AvatarController],
  exports: [AvatarService],
})
export class AvatarModule {}
