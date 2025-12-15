import { request } from '@umijs/max';
import type {
  GetModuleListRequest,
  GetModuleListResponse,
} from './typings';

/*
 * ------------|| /api/workcenter/getmodulelist ------------||
 */

/**
 * 获取工作中心模块列表
 * @param params - 包含菜单名的请求参数
 * @returns Promise<GetModuleListResponse> 模块列表响应
 */
export async function getModuleList(params: GetModuleListRequest): Promise<GetModuleListResponse> {
  console.log('[GetModuleList Service] 开始请求工作中心模块列表');
  console.log('[GetModuleList Service] 请求参数:', params);
  
  try {
    const requestBody = { name: params.name };
    console.log('[GetModuleList Service] 发送的请求体:', JSON.stringify(requestBody));
    
    const response = await request<GetModuleListResponse>('/api/workcenter/getmodulelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
      // token通过Authorization header自动发送
    });
    
    console.log('[GetModuleList Service] 模块列表请求成功');
    console.log('[GetModuleList Service] 响应数据:', response);
    
    return response;
  } catch (error) {
    console.error('[GetModuleList Service] 模块列表请求失败:', error);
    throw error;
  }
}
