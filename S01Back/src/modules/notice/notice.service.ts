import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice, NoticeType, TargetType } from '../../entities/notice.entity';
import { NoticeRead } from '../../entities/notice-read.entity';
import { User } from '../../entities/user.entity';

/**
 * 通知服务
 */
@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepo: Repository<Notice>,
    @InjectRepository(NoticeRead)
    private readonly noticeReadRepo: Repository<NoticeRead>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 获取用户的通知列表
   */
  async getNoticeList(userId: number, userRole: string, page = 1, pageSize = 10) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    const query = this.noticeRepo.createQueryBuilder('notice')
      .where('notice.is_published = 1')
      .andWhere('notice.publish_time <= :now', { now: new Date() })
      .andWhere(`(
        notice.target_type = 'all'
        OR (notice.target_type = 'role' AND JSON_CONTAINS(notice.target_ids, :role))
        OR (notice.target_type = 'user' AND JSON_CONTAINS(notice.target_ids, :userId))
      )`, { role: JSON.stringify(userRole), userId: JSON.stringify(userId) });

    const [list, total] = await query
      .orderBy('notice.publish_time', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 获取已读状态
    const noticeIds = list.map(n => n.id);
    const reads = await this.noticeReadRepo.find({
      where: { userId },
    });
    const readIds = new Set(reads.map(r => r.noticeId));

    const listWithReadStatus = list.map(notice => ({
      ...notice,
      isRead: readIds.has(notice.id),
    }));

    return { list: listWithReadStatus, total, page, pageSize };
  }

  /**
   * 获取通知详情
   */
  async getNoticeDetail(noticeId: number, userId: number) {
    const notice = await this.noticeRepo.findOne({
      where: { id: noticeId },
    });
    if (!notice) {
      throw new NotFoundException('通知不存在');
    }

    // 检查是否已读
    const read = await this.noticeReadRepo.findOne({
      where: { noticeId, userId },
    });

    return {
      ...notice,
      isRead: !!read,
    };
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(noticeId: number, userId: number) {
    const existing = await this.noticeReadRepo.findOne({
      where: { noticeId, userId },
    });
    if (!existing) {
      await this.noticeReadRepo.save({ noticeId, userId });
    }
    return { success: true };
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: number, userRole: string) {
    const notices = await this.getNoticeList(userId, userRole, 1, 1000);
    for (const notice of notices.list) {
      if (!notice.isRead) {
        await this.noticeReadRepo.save({ noticeId: notice.id, userId });
      }
    }
    return { success: true };
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(userId: number, userRole: string) {
    const notices = await this.getNoticeList(userId, userRole, 1, 1000);
    const unreadCount = notices.list.filter(n => !n.isRead).length;
    return { count: unreadCount };
  }

  /**
   * 创建通知（系统用）
   */
  async createNotice(data: Partial<Notice>) {
    const notice = this.noticeRepo.create(data);
    return this.noticeRepo.save(notice);
  }

  /**
   * 发布通知
   */
  async publishNotice(noticeId: number) {
    await this.noticeRepo.update(noticeId, {
      isPublished: 1,
      publishTime: new Date(),
    });
    return this.noticeRepo.findOne({ where: { id: noticeId } });
  }

  /**
   * 创建业务通知
   */
  async createBusinessNotice(
    title: string,
    content: string,
    noticeType: NoticeType,
    businessType: string,
    businessId: number,
    targetType: TargetType,
    targetIds: number[],
    senderId?: number,
  ) {
    const notice = await this.createNotice({
      title,
      content,
      noticeType,
      businessType,
      businessId,
      targetType,
      targetIds,
      senderId,
      isPublished: 1,
      publishTime: new Date(),
    });
    return notice;
  }
}
