import { Controller, Post, Body, Headers } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { ResultDto } from '@/common/dto/result.dto';
import { FavoriteDTO, FavoriteAddRequest, FavoriteRemoveRequest, FavoriteSortRequest, SortItem } from './dto/favorite.dto';
import { JwtUtil } from '@/common/utils/jwt.util';

/**
 * 收藏控制器
 * 接口路径和响应格式与 Java 端 FavoriteController 完全一致
 */
@Controller('api/favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * 获取收藏列表
   * POST /api/favorite/get
   */
  @Post('get')
  async getFavorites(@Headers('authorization') token?: string): Promise<ResultDto<FavoriteDTO[]>> {
    try {
      // 从token获取用户ID
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.error(401, '缺少授权token');
      }

      const jwtToken = token.substring(7);
      const userId = JwtUtil.getUserIdFromToken(jwtToken);
      if (!userId) {
        return ResultDto.error(401, '无效的用户token');
      }

      const favorites = await this.favoriteService.getUserFavorites(userId);
      return ResultDto.success(favorites, '获取收藏列表成功');
    } catch (e) {
      return ResultDto.error(500, '服务器内部错误');
    }
  }

  /**
   * 添加收藏
   * POST /api/favorite/add
   */
  @Post('add')
  async addFavorite(
    @Body() body: any,
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<string>> {
    try {
      // 从token获取用户ID
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.error(401, '缺少授权token');
      }

      const jwtToken = token.substring(7);
      const userId = JwtUtil.getUserIdFromToken(jwtToken);
      if (!userId) {
        return ResultDto.error(401, '无效的用户token');
      }

      // 直接从 body 读取字段，兼容前端请求格式
      const request: FavoriteAddRequest = {
        id: body.id,
        name: body.name,
        description: body.description,
        icon: body.icon,
        port: body.port,
        url: body.url,
      };

      const success = await this.favoriteService.addFavorite(userId, request);
      if (success) {
        return ResultDto.success('添加收藏成功');
      } else {
        return ResultDto.error(400, '添加收藏失败，可能已经收藏或模块不存在');
      }
    } catch (e) {
      return ResultDto.error(500, '服务器内部错误');
    }
  }

  /**
   * 移除收藏
   * POST /api/favorite/remove
   */
  @Post('remove')
  async removeFavorite(
    @Body() body: any,
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<string>> {
    try {
      // 从token获取用户ID
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.error(401, '缺少授权token');
      }

      const jwtToken = token.substring(7);
      const userId = JwtUtil.getUserIdFromToken(jwtToken);
      if (!userId) {
        return ResultDto.error(401, '无效的用户token');
      }

      // 直接从 body 读取字段
      const request: FavoriteRemoveRequest = {
        id: body.id,
      };

      const success = await this.favoriteService.removeFavorite(userId, request);
      if (success) {
        return ResultDto.success('移除收藏成功');
      } else {
        return ResultDto.error(400, '移除收藏失败，可能未收藏该模块');
      }
    } catch (e) {
      return ResultDto.error(500, '服务器内部错误');
    }
  }

  /**
   * 收藏排序
   * POST /api/favorite/sort
   * 兼容两种请求格式：
   * 1. { sortItems: [{id, sort}, ...] }
   * 2. 直接数组 [{id, sort}, ...]
   */
  @Post('sort')
  async sortFavorites(
    @Body() request: FavoriteSortRequest | SortItem[],
    @Headers('authorization') token?: string,
  ): Promise<ResultDto<string>> {
    try {
      // 从token获取用户ID
      if (!token || !token.startsWith('Bearer ')) {
        return ResultDto.error(401, '缺少授权token');
      }

      const jwtToken = token.substring(7);
      const userId = JwtUtil.getUserIdFromToken(jwtToken);
      if (!userId) {
        return ResultDto.error(401, '无效的用户token');
      }

      // 兼容两种格式：直接数组或包装在 sortItems 里
      let sortRequest: FavoriteSortRequest;
      if (Array.isArray(request)) {
        sortRequest = { sortItems: request };
      } else {
        sortRequest = request;
      }

      const success = await this.favoriteService.sortFavorites(userId, sortRequest);
      if (success) {
        return ResultDto.success('收藏排序成功');
      } else {
        return ResultDto.error(400, '收藏排序失败');
      }
    } catch (e) {
      return ResultDto.error(500, '服务器内部错误');
    }
  }
}
