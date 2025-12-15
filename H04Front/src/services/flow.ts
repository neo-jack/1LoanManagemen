import { request } from '@umijs/max';

// ==================== 流程审核功能 ====================

/**
 * 获取待办任务列表
 */
export async function getTodoTasks() {
  return request('/api/flow/audit/todo', { method: 'GET' });
}

/**
 * 获取已办任务列表
 */
export async function getDoneTasks() {
  return request('/api/flow/audit/done', { method: 'GET' });
}

/**
 * 获取抄送任务列表
 */
export async function getCopiedTasks() {
  return request('/api/flow/audit/copied', { method: 'GET' });
}

/**
 * 获取任务详情
 */
export async function getTaskDetail(id: number) {
  return request(`/api/flow/audit/task/${id}`, { method: 'GET' });
}

/**
 * 审批通过
 */
export async function approveTask(id: number, comment?: string) {
  return request(`/api/flow/audit/${id}/approve`, { method: 'POST', data: { comment } });
}

/**
 * 审批驳回
 */
export async function rejectTask(id: number, comment: string) {
  return request(`/api/flow/audit/${id}/reject`, { method: 'POST', data: { comment } });
}

// ==================== 流程配置功能（总审核） ====================

/**
 * 获取所有流程配置
 */
export async function getAllFlowConfigs() {
  return request('/api/flow/config', { method: 'GET' });
}

/**
 * 获取流程配置详情及节点
 */
export async function getFlowConfigWithNodes(id: number) {
  return request(`/api/flow/config/${id}`, { method: 'GET' });
}

/**
 * 创建流程配置
 */
export async function createFlowConfig(data: any) {
  return request('/api/flow/config', { method: 'POST', data });
}

/**
 * 更新流程配置
 */
export async function updateFlowConfig(id: number, data: any) {
  return request(`/api/flow/config/${id}`, { method: 'PUT', data });
}

/**
 * 保存流程节点
 */
export async function saveFlowNodes(id: number, nodes: any[]) {
  return request(`/api/flow/config/${id}/nodes`, { method: 'POST', data: nodes });
}

/**
 * 提交流程配置审核
 */
export async function submitFlowConfig(id: number) {
  return request(`/api/flow/config/${id}/submit`, { method: 'POST' });
}

/**
 * 审核通过流程配置
 */
export async function approveFlowConfig(id: number) {
  return request(`/api/flow/config/${id}/approve`, { method: 'POST' });
}
