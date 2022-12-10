import umiRequest, { extend } from 'umi-request';
import { notification, message } from 'antd';
// const mockPrefix = '/mock/94240/';

const codeMessage: Record<number, string> = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/** 异常处理程序 */
const errorHandler = (error: { response: Response }): Response => {
  const { response, data } = error;
  if (response && response.status) {
    // const errorText = codeMessage[response.status] || response.statusText;
    // const { status, url } = response;
    message.error(data.message);
    throw new Error(data.message);
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return response;
};

umiRequest.interceptors.request.use((url, options) => {
  const Authorization = localStorage.getItem('token') as string;

  // 基础header
  const headers = {
    Authorization,
  };
  // 更新头部
  return {
    url,
    options: { ...options, headers, interceptors: true },
  };
});

export const request = extend({
  prefix: '/api',
  errorHandler, // 默认错误处理
  timeout: 14000,
});

/**
 * 统一错误代码定义
 */
export const ErrorCodeMap = {
  200: 'ok',

  // 10000 - 99999 业务操作错误
  10000: '参数校验异常',
  10001: '系统用户已存在',
  10002: '填写验证码有误',
  10003: '用户名密码有误',
  10004: '节点路由已存在',
  10005: '权限必须包含父节点',
  10006: '非法操作：该节点仅支持目录类型父节点',
  10007: '非法操作：节点类型无法直接转换',
  10008: '该角色存在关联用户，请先删除关联用户',
  10009: '该部门存在关联用户，请先删除关联用户',
  10010: '该部门存在关联角色，请先删除关联角色',
  10015: '该部门存在子部门，请先删除子部门',
  10011: '旧密码与原密码不一致',
  10012: '如想下线自身可右上角退出',
  10013: '不允许下线该用户',
  10014: '父级菜单不存在',
  10016: '系统内置功能不允许操作',
  10017: '用户不存在',
  10018: '无法查找当前用户所属部门',
  10019: '部门不存在',
  10020: '任务不存在',
  10021: '参数配置键值对已存在',
  10101: '不安全的任务，确保执行的加入@Mission注解',
  10102: '所执行的任务不存在',

  // token相关
  11001: '登录无效或无权限访问',
  11002: '登录身份已过期',
  11003: '无权限，请联系管理员申请权限',

  // OSS相关
  20001: '当前创建的文件或目录已存在',
  20002: '无需操作',
  20003: '已超出支持的最大处理数量',
} as const;

export type ErrorCodeMapType = keyof typeof ErrorCodeMap;

export interface HttpError extends Error {
  code: string;
  message: string;
}

export async function tryCatch<T, R>(
  service: (args?: R) => Promise<API.ApiResponseDo<T>>,
  args?: R,
): Promise<[T, HttpError]> {
  try {
    const apiResult = await service(args as R);
    if (apiResult.code === 200) {
      return [apiResult.data, null as any];
    }
    message.error(apiResult.message);
    return [
      null as any,
      {
        code: apiResult.code,
        message: apiResult.message,
      } as unknown as HttpError,
    ];
  } catch (e: any) {
    message.error(e.toString());
    return [null as any, e as any];
  }
}

export async function tryCatchTwitter<T, R>(
  service: (args?: R) => Promise<API.ApiResponseDo<T>>,
  args?: R,
): Promise<[T, HttpError]> {
  try {
    const apiResult = await service(args as R);
    const { data } = apiResult;
    const tmpData = data as API.TwitterData;
    if (apiResult.code === 200 && tmpData?.data) {
      return [tmpData?.data as any, null as any];
    } else if (apiResult.code === 200 && !tmpData?.data) {
      return [null as any, tmpData?.errors as any];
    }
    message.error(apiResult.message);
    return [
      null as any,
      {
        code: apiResult.code,
        message: apiResult.message,
      } as unknown as HttpError,
    ];
  } catch (e: any) {
    message.error(e.toString());
    return [null as any, e as any];
  }
}
