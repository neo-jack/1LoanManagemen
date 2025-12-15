import { Controller, Get, Headers, Param, ParseIntPipe } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ResultDto } from '@/common/dto/result.dto';
import { MenuDto } from './dto/menu.dto';
import { JwtUtil } from '@/common/utils/jwt.util';

/**
 * 菜单控制器
 */
@Controller('api/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * 获取当前用户的菜单列表
   */
  @Get('list')
  async getUserMenus(@Headers('authorization') token?: string): Promise<ResultDto<MenuDto[]>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);
    
    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    const userId = JwtUtil.getUserIdFromToken(jwtToken);
    const menus = await this.menuService.getMenusByUserId(userId);
    
    return ResultDto.success(menus, '获取菜单列表成功');
  }

  /**
   * 获取所有菜单（管理员功能）
   */
  @Get('all')
  async getAllMenus(@Headers('authorization') token?: string): Promise<ResultDto<MenuDto[]>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);
    
    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    const menus = await this.menuService.getAllMenus();
    
    return ResultDto.success(menus, '获取所有菜单成功');
  }

  /**
   * 根据ID获取菜单详情
   */
  @Get(':id')
  async getMenuById(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<MenuDto>> {
    if (!token || !token.startsWith('Bearer ')) {
      return ResultDto.fail('未登录');
    }

    const jwtToken = token.substring(7);
    
    if (!JwtUtil.validateToken(jwtToken)) {
      return ResultDto.fail('登录已过期');
    }

    const menu = await this.menuService.getMenuById(id);
    
    if (!menu) {
      return ResultDto.fail('菜单不存在');
    }
    
    return ResultDto.success(menu, '获取菜单详情成功');
  }
}
