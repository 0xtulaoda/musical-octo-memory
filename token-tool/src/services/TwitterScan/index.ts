import { request } from '../ant-design-pro/base';
import { TwitterUser } from './type';

export interface PageResult<T> {
  list: T[];
  total: number;
}

export interface TitterResult<T> {
  data: T;
  _headers: any;
}

export async function findTwitterMonitorListByPage(
  args: any,
): Promise<API.ApiResponseDo<API.PageResult<TwitterUser>>> {
  return request(`/twitter/findTwitterMonitorListByPage`, {
    method: 'POST',
    data: {
      ...args,
    },
  });
}

export async function searchByUserName(args: any): Promise<API.ApiResponseDo<TwitterUser>> {
  return request(`/twitter/searchByUserName`, {
    method: 'POST',
    data: {
      ...args,
    },
  });
}

/** 新建规则 PUT /api/rule */
export async function updateTwitterOwner(params: any, options?: { [key: string]: any }) {
  return request<TwitterUser>(`/twitter/update`, {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addTwitterOwner(params: TwitterUser, options?: { [key: string]: any }) {
  return request<TwitterUser>(`/twitter/add`, {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeTwitterOwner(params: any, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/twitter/delete/${params._id}`, {
    method: 'DELETE',
    // params: params,
    ...(options || {}),
  });
}

export async function findTwitterFollowerList(
  params: {
    // query
    /** 当前的页码 */
    page: number;
    /** 页面的容量 */
    pageSize: number;
  },
  options?: { [key: string]: any },
): Promise<API.ApiResponseDo<API.PageResult<TwitterUser>>> {
  return request(`/follower/findTwitterFollowerList`, {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

// 获取最新关注列表
export async function findTwitterNewFollowerList(
  params: {
    // query
    /** 当前的页码 */
    page: number;
    /** 页面的容量 */
    pageSize: number;
  },
  options?: { [key: string]: any },
): Promise<API.ApiResponseDo<API.PageResult<TwitterUser>>> {
  return request(`/follower/findTwitterNewFollowerList`, {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}
