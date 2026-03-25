import { request } from '@umijs/max';

// ==================== 学生还款功能 ====================

/**
 * 获取学生的还款计划列表
 */
export async function getRepaymentPlans() {
  return request('/api/repayment/plans', { method: 'GET' });
}

/**
 * 获取还款计划详情
 */
export async function getRepaymentPlanDetail(id: number) {
  return request(`/api/repayment/plan/${id}`, { method: 'GET' });
}

/**
 * 获取还款提醒
 */
export async function getRepaymentReminders() {
  return request('/api/repayment/reminders', { method: 'GET' });
}

/**
 * 在线还款
 */
export async function repaySchedule(scheduleId: number, attachments: any[]) {
  return request(`/api/repayment/pay/${scheduleId}`, {
    method: 'POST',
    data: { attachments },
  });
}

// ==================== 审核员统计与催收 ====================

/**
 * 获取统计数据
 */
export async function getStatistics() {
  return request('/api/repayment/statistics', { method: 'GET' });
}

/**
 * 获取逾期贷款列表
 */
export async function getOverdueList() {
  return request('/api/repayment/overdue', { method: 'GET' });
}

/**
 * 添加催收记录
 */
export async function addCollection(data: any) {
  return request('/api/repayment/collection', { method: 'POST', data });
}

/**
 * 获取催收记录
 */
export async function getCollections(applicationId?: number) {
  return request('/api/repayment/collections', {
    method: 'GET',
    params: applicationId ? { applicationId } : {},
  });
}
