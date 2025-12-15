import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { UserAvatar } from '@/entities/user-avatar.entity';
import { UserService } from './user.service';
import { UserAvatarController } from './user-avatar.controller';
import { AvatarFileController } from './avatar-file.controller';
import { QRCodeController } from './qrcode.controller';
import { SetPasswordController } from './setpassword.controller';
import { DatabaseAvatarController } from './database-avatar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAvatar])],
  providers: [UserService],
  controllers: [
    UserAvatarController,
    AvatarFileController,
    QRCodeController,
    SetPasswordController,
    DatabaseAvatarController,
  ],
  exports: [UserService],
})
export class UserModule {}
