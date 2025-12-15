import { request } from '@umijs/max';

// ==================== 学生申请功能 ====================

/**
 * 获取可用的表单配置列表
 */
export async function getFormConfigs() {
  return request('/api/loan/form-configs', { method: 'GET' });
}

/**
 * 获取表单配置详情及字段
 */
export async function getFormConfigWithFields(loanType: string) {
  return request(`/api/loan/form-config/${loanType}`, { method: 'GET' });
}

/**
 * 创建贷款申请
 */
export async function createApplication(data: any) {
  return request('/api/loan/apply', { method: 'POST', data });
}

/**
 * 提交贷款申请
 */
export async function submitApplication(id: number) {
  return request(`/api/loan/apply/${id}/submit`, { method: 'POST' });
}

/**
 * 获取学生的申请列表
 */
export async function getApplicationList(params?: { status?: string }) {
  return request('/api/loan/apply/list', { method: 'GET', params });
}

/**
 * 获取申请详情
 */
export async function getApplicationDetail(id: number) {
  return request(`/api/loan/apply/${id}`, { method: 'GET' });
}

// ==================== 表单配置功能（总审核） ====================

/**
 * 获取所有表单配置
 */
export async function getAllFormConfigs() {
  return request('/api/loan/form/config', { method: 'GET' });
}

/**
 * 创建表单配置
 */
export async function createFormConfig(data: any) {
  return request('/api/loan/form/config', { method: 'POST', data });
}

/**
 * 更新表单配置
 */
export async function updateFormConfig(id: number, data: any) {
  return request(`/api/loan/form/config/${id}`, { method: 'PUT', data });
}

/**
 * 保存表单字段
 */
export async function saveFormFields(id: number, fields: any[]) {
  return request(`/api/loan/form/config/${id}/fields`, { method: 'POST', data: fields });
}

/**
 * 获取表单字段
 */
export async function getFormFields(id: number) {
  return request(`/api/loan/form/config/${id}/fields`, { method: 'GET' });
}
