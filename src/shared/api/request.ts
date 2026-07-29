import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';
import { Message } from '@arco-design/web-react';

/** 与生成的 `API.BaseResponse` 成功约定一致 */
const API_SUCCESS_CODE = 0;

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';

/**
 * 登录态存储 key：业务层把接口返回的 access_token 写入此 key
 */
export const AUTH_TOKEN_STORAGE_KEY = 'token';

export interface RequestFailedError {
  status?: number;
  bizCode?: number;
  message: string;
  original?: unknown;
}

type RequestConfig = InternalAxiosRequestConfig & { skipErrorHandler?: boolean };

/** openapi2ts 期望 request 直接返回业务数据 T，而不是 AxiosResponse<T> */
export type Request = {
  <T = unknown>(config: AxiosRequestConfig): Promise<T>;
  <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  head: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  options: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => Promise<T>;
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => Promise<T>;
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) => Promise<T>;
} & Omit<AxiosInstance, 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'>;

/** 401 时回调（清会话 / 跳登录），在 app 启动时注册 */
let onUnauthorized: (() => void) | undefined;

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export function getAccessToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function pickServerMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }
  const o = data as Record<string, unknown>;
  const msg = o.message ?? o.msg ?? o.error;
  return typeof msg === 'string' ? msg : undefined;
}

function isApiBasePayload(data: unknown): data is API.BaseResponse {
  return (
    data !== null &&
    typeof data === 'object' &&
    typeof (data as API.BaseResponse).code === 'number'
  );
}

function resolveFailMessage(error: AxiosError): { status?: number; message: string } {
  const status = error.response?.status;
  const fromServer = pickServerMessage(error.response?.data);
  if (fromServer) {
    return { status, message: fromServer };
  }
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return { status, message: '请求超时，请稍后重试' };
  }
  return { status, message: error.message || '请求失败' };
}

const instance = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 15000
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, config } = response;
    const rt = config.responseType;
    if (rt === 'blob' || rt === 'arraybuffer') {
      return data;
    }

    if (isApiBasePayload(data) && data.code !== API_SUCCESS_CODE) {
      const cfg = config as RequestConfig;
      const silent = cfg.skipErrorHandler === true;
      const msg =
        typeof data.message === 'string' && data.message ? data.message : '请求失败';
      const bizCode = data.code;

      if (!silent) {
        if (bizCode === 401) {
          Message.error('登录已失效，请重新登录');
          onUnauthorized?.();
        } else {
          Message.error(msg);
        }
      }

      return Promise.reject({
        bizCode,
        message: msg,
        original: data
      } satisfies RequestFailedError);
    }

    return data;
  },
  (error: AxiosError) => {
    const cfg = error.config as RequestConfig | undefined;
    const silent = cfg?.skipErrorHandler === true;
    const { status, message } = resolveFailMessage(error);

    if (status === 401) {
      if (!silent) {
        Message.error('登录已失效，请重新登录');
      }
      onUnauthorized?.();
    } else if (!silent) {
      Message.error(message);
    }

    return Promise.reject({
      status,
      message,
      original: error
    } satisfies RequestFailedError);
  }
);

export const request = instance as Request;

export default request;
