import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from '@/entities/menu.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { UserMenuController } from './user-menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  providers: [MenuService],
  controllers: [MenuController, UserMenuController],
  exports: [MenuService],
})
export class MenuModule {}
