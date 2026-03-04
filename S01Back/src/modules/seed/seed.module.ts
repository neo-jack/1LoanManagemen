import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { Menu } from '@/entities/menu.entity';
import { SystemModule } from '@/entities/system-module.entity';
import { WorkCenterCategory } from '@/entities/work-center-category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Menu, SystemModule, WorkCenterCategory]),
  ],
})
export class SeedModule implements OnModuleInit {
  private readonly logger = new Logger(SeedModule.name);
  private readonly dataPath = path.join(process.cwd(), '..', 'Data');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(SystemModule)
    private readonly moduleRepository: Repository<SystemModule>,
    @InjectRepository(WorkCenterCategory)
    private readonly categoryRepository: Repository<WorkCenterCategory>,
  ) {}

  async onModuleInit() {
    this.logger.log('开始同步本地 Data 目录数据到数据库...');
    try {
      await this.seedUsers();
      await this.seedMenus();
      await this.seedCategories();
      await this.seedModules();
      this.logger.log('✅ 所有本地数据同步完成');
    } catch (error) {
      this.logger.error('❌ 数据同步失败:', error);
    }
  }

  private async seedUsers() {
    const users = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'users.json'), 'utf-8'));
    for (const data of users) {
      const exists = await this.userRepository.findOne({ where: { username: data.username } });
      if (!exists) {
        await this.userRepository.save(this.userRepository.create({
          ...data,
          userName: data.user_name, // 适配实体字段名
          userAvatar: data.user_avatar,
          userRole: data.user_role,
          hospitalId: data.hospital_id,
          hospitalCname: data.hospital_cname,
        }));
        this.logger.log(`[Seed] 用户 ${data.username} 同步成功`);
      }
    }
  }

  private async seedMenus() {
    const menus = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'system_menus.json'), 'utf-8'));
    for (const data of menus) {
      const exists = await this.menuRepository.findOne({ where: { menuNo: data.menu_no } });
      if (!exists) {
        await this.menuRepository.save(this.menuRepository.create({
          ...data,
          userId: data.user_id,
          synergyId: data.synergy_id,
          menuNo: data.menu_no,
          menuName: data.menu_name,
          menuIcon: data.menu_icon,
          menuUrl: data.menu_url,
          sysMenu: data.sys_menu,
          parentCode: data.parent_code,
          menuModule: data.menu_module,
          menuSort: data.menu_sort,
          becallModuleId: data.becall_module_id,
        }));
      } else {
        // 强制更新 URL 确保点击有效
        if (exists.menuUrl !== data.menu_url) {
          exists.menuUrl = data.menu_url;
          await this.menuRepository.save(exists);
        }
      }
    }
    this.logger.log(`[Seed] 菜单数据同步完成`);
  }

  private async seedCategories() {
    const categories = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'work_center_categories.json'), 'utf-8'));
    for (const data of categories) {
      const exists = await this.categoryRepository.findOne({ where: { categoryName: data.category_name } });
      if (!exists) {
        await this.categoryRepository.save(this.categoryRepository.create({
          categoryId: data.category_id,
          categoryName: data.category_name,
          categoryIcon: data.category_icon,
          sortOrder: data.sort_order,
          status: data.status,
        }));
        this.logger.log(`[Seed] 分类 ${data.category_name} 同步成功`);
      }
    }
  }

  private async seedModules() {
    const modules = JSON.parse(fs.readFileSync(path.join(this.dataPath, 'system_modules.json'), 'utf-8'));
    for (const data of modules) {
      const exists = await this.moduleRepository.findOne({ where: { moduleCode: data.module_code } });
      if (!exists) {
        await this.moduleRepository.save(this.moduleRepository.create({
          moduleCode: data.module_code,
          moduleName: data.module_name,
          description: data.description,
          icon: data.icon,
          port: data.port,
          url: data.url,
          categoryName: data.category_name,
          status: data.status,
        }));
        this.logger.log(`[Seed] 模块 ${data.module_name} 同步成功`);
      }
    }
  }
}
