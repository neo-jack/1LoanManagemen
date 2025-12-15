import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Favorite } from '@/entities/favorite.entity';
import { FavoriteDTO, FavoriteAddRequest, FavoriteRemoveRequest, FavoriteSortRequest } from './dto/favorite.dto';

/**
 * 收藏服务
 * 业务逻辑与 Java 端 FavoriteServiceImpl 完全一致
 */
@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取用户收藏列表
   * 完全参考 Java 端 FavoriteServiceImpl.getUserFavorites 实现
   * @param userId 用户ID
   * @returns 收藏列表
   */
  async getUserFavorites(userId: number): Promise<FavoriteDTO[]> {
    this.logger.log(`[FavoriteService] 获取用户${userId}的收藏列表`);

    // 使用原生 SQL 查询
    const favorites = await this.dataSource.query(
      'SELECT module_id, module_name, description, icon, port, url, sort_order FROM user_favorites WHERE user_id = ? ORDER BY sort_order ASC',
      [userId],
    );

    const result: FavoriteDTO[] = favorites.map((row: any) => ({
      id: row.module_id,
      name: row.module_name,
      description: row.description,
      icon: row.icon,
      port: row.port,
      url: row.url,
      sort: row.sort_order,
    }));

    this.logger.log(`[FavoriteService] 用户${userId}获取到${result.length}个收藏`);
    return result;
  }

  /**
   * 添加收藏
   * 完全参考 Java 端 FavoriteServiceImpl.addFavorite 实现
   * @param userId 用户ID
   * @param request 添加收藏请求
   * @returns 操作结果
   */
  async addFavorite(userId: number, request: FavoriteAddRequest): Promise<boolean> {
    this.logger.log(`[FavoriteService] 用户${userId}添加收藏: ${request.id}`);

    try {
      // 1. 检查是否已经收藏（使用原生 SQL）
      const existingRows = await this.dataSource.query(
        'SELECT id FROM user_favorites WHERE user_id = ? AND module_id = ? LIMIT 1',
        [userId, request.id],
      );

      if (existingRows && existingRows.length > 0) {
        this.logger.warn(`[FavoriteService] 用户${userId}已收藏模块${request.id}`);
        return false;
      }

      // 2. 获取下一个排序号（使用原生 SQL）
      const maxSortRows = await this.dataSource.query(
        'SELECT MAX(sort_order) as maxSort FROM user_favorites WHERE user_id = ?',
        [userId],
      );
      const maxSort = maxSortRows?.[0]?.maxSort || 0;
      const nextSort = maxSort + 1;

      // 3. 插入收藏记录（使用原生 SQL）
      const now = new Date();
      await this.dataSource.query(
        `INSERT INTO user_favorites 
         (user_id, module_id, module_name, description, icon, port, url, sort_order, is_favorite, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          userId,
          request.id,
          request.name,
          request.description,
          request.icon,
          request.port,
          request.url,
          nextSort,
          now,
          now,
        ],
      );

      this.logger.log(`[FavoriteService] 用户${userId}添加收藏${request.id}成功`);
      return true;
    } catch (e) {
      this.logger.error(`[FavoriteService] 添加收藏失败: ${e.message}`, e.stack);
      return false;
    }
  }

  /**
   * 移除收藏
   * 完全参考 Java 端 FavoriteServiceImpl.removeFavorite 实现
   * @param userId 用户ID
   * @param request 移除收藏请求
   * @returns 操作结果
   */
  async removeFavorite(userId: number, request: FavoriteRemoveRequest): Promise<boolean> {
    this.logger.log(`[FavoriteService] 用户${userId}移除收藏: ${request.id}`);

    try {
      // 1. 检查收藏是否存在（使用原生 SQL）
      const existingRows = await this.dataSource.query(
        'SELECT id FROM user_favorites WHERE user_id = ? AND module_id = ? LIMIT 1',
        [userId, request.id],
      );

      if (!existingRows || existingRows.length === 0) {
        this.logger.warn(`[FavoriteService] 用户${userId}未收藏模块${request.id}`);
        return false;
      }

      // 2. 删除收藏记录（使用原生 SQL）
      const existingId = existingRows[0].id;
      await this.dataSource.query('DELETE FROM user_favorites WHERE id = ?', [existingId]);

      this.logger.log(`[FavoriteService] 用户${userId}移除收藏${request.id}成功`);
      return true;
    } catch (e) {
      this.logger.error(`[FavoriteService] 移除收藏失败: ${e.message}`, e.stack);
      return false;
    }
  }

  /**
   * 收藏排序
   * 完全参考 Java 端 FavoriteServiceImpl.sortFavorites 实现
   * @param userId 用户ID
   * @param request 排序请求
   * @returns 操作结果
   */
  async sortFavorites(userId: number, request: FavoriteSortRequest): Promise<boolean> {
    this.logger.log(`[FavoriteService] 用户${userId}收藏排序，项目数: ${request?.sortItems?.length || 0}`);

    try {
      // 检查排序项是否为空
      if (!request?.sortItems || request.sortItems.length === 0) {
        this.logger.warn(`[FavoriteService] 排序项为空`);
        return true;
      }

      // 批量更新排序（使用原生 SQL）
      for (const item of request.sortItems) {
        await this.dataSource.query(
          'UPDATE user_favorites SET sort_order = ? WHERE user_id = ? AND module_id = ?',
          [item.sort, userId, item.id],
        );
      }

      this.logger.log(`[FavoriteService] 用户${userId}收藏排序成功`);
      return true;
    } catch (e) {
      this.logger.error(`[FavoriteService] 收藏排序失败: ${e.message}`, e.stack);
      return false;
    }
  }
}
