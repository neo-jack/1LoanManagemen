import { request } from '@umijs/max';

/**
 * HR 人事管理 API 服务
 */

// ==================== 学生管理 ====================

/**
 * 获取学生列表
 */
export async function getStudentList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return request('/api/hr/student/list', {
    method: 'GET',
    params,
  });
}

/**
 * 获取学生详情
 */
export async function getStudentDetail(id: number) {
  return request(`/api/hr/student/${id}`, {
    method: 'GET',
  });
}

/**
 * 更新学生信息
 */
export async function updateStudent(id: number, data: Record<string, any>) {
  return request(`/api/hr/student/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 创建学生
 */
export async function createStudent(data: Record<string, any>) {
  return request('/api/hr/student', {
    method: 'POST',
    data,
  });
}

/**
 * 删除学生
 */
export async function deleteStudent(id: number) {
  return request(`/api/hr/student/${id}`, {
    method: 'DELETE',
  });
}

// ==================== 审核员管理 ====================

/**
 * 获取审核员列表
 */
export async function getAuditorList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return request('/api/hr/auditor/list', {
    method: 'GET',
    params,
  });
}

/**
 * 获取审核员详情
 */
export async function getAuditorDetail(id: number) {
  return request(`/api/hr/auditor/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建审核员
 */
export async function createAuditor(data: Record<string, any>) {
  return request('/api/hr/auditor', {
    method: 'POST',
    data,
  });
}

/**
 * 更新审核员信息
 */
export async function updateAuditor(id: number, data: Record<string, any>) {
  return request(`/api/hr/auditor/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除审核员
 */
export async function deleteAuditor(id: number) {
  return request(`/api/hr/auditor/${id}`, {
    method: 'DELETE',
  });
}
