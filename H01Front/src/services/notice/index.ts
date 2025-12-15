// 通知服务模块
import { request } from '@umijs/max';

// 通知类型
export type NoticeType = 'system' | 'loan' | 'flow';

// 目标类型
export type TargetType = 'all' | 'department' | 'user';

// 通知项接口
export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  noticeType: NoticeType;
  targetType: TargetType;
  publishTime: string;
  isRead: boolean;
  publisherId: string;
  publisherName: string;
}

// 获取通知列表参数
export interface GetNoticeListParams {
  page?: number;
  pageSize?: number;
  noticeType?: NoticeType;
  isRead?: boolean;
}

// 获取通知列表
export async function getNoticeList(params: GetNoticeListParams = {}) {
  return request<{
    code: number;
    data: {
      list: NoticeItem[];
      total: number;
    };
    message: string;
  }>('/api/notice/list', {
    method: 'GET',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...params,
    },
  });
}

// 获取通知详情
export async function getNoticeDetail(id: string) {
  return request<{
    code: number;
    data: NoticeItem;
    message: string;
  }>(`/api/notice/${id}`, {
    method: 'GET',
  });
}

// 标记通知为已读
export async function markNoticeAsRead(id: string) {
  return request<{
    code: number;
    message: string;
  }>(`/api/notice/${id}/read`, {
    method: 'POST',
  });
}

// 标记所有通知为已读
export async function markAllNoticeAsRead() {
  return request<{
    code: number;
    message: string;
  }>('/api/notice/read-all', {
    method: 'POST',
  });
}

// 获取未读通知数量
export async function getUnreadCount() {
  return request<{
    code: number;
    data: {
      count: number;
    };
    message: string;
  }>('/api/notice/unread/count', {
    method: 'GET',
  });
}
