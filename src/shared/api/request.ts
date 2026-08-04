import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';
import { Message } from '@arco-design/web-react';

import {
  isIpAccessDeniedError,
  redirectToIpAccessDenied
} from '@shared/lib/ipAccessDenied';

/** 业务成功码（与 Admin OpenAPI ResponseBase / ApiCode 的 0 一致） */
const API_SUCCESS_CODE = 0;

/** 响应拦截用的宽松 envelope；不绑死 ApiCode 联合，以便识别 401 等业务码 */
type ApiEnvelope = {
  code: number;
  message?: string;
};

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';

/**
 * 登录态存储 key：业务层把接口返回的 access_token 写入此 key
 */
export const AUTH_TOKEN_STORAGE_KEY = 'token';
export const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
export const AUTH_DEVICE_ID_STORAGE_KEY = 'device_id';

export interface RequestFailedError {
  status?: number;
  bizCode?: number;
  message: string;
  original?: unknown;
}

type RequestConfig = InternalAxiosRequestConfig & {
  skipErrorHandler?: boolean;
  /** 跳过 401 自动 refresh（refresh 自身、登录等） */
  skipAuthRefresh?: boolean;
  /** 已因 401 重试过一次，避免死循环 */
  __isRetryRequest?: boolean;
};

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
} & Omit<
  AxiosInstance,
  'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'
>;

/** 401 且 refresh 失败时回调（清会话 / 跳登录），在 app 启动时注册 */
let onUnauthorized: (() => void) | undefined;

/** 并发 401 共用同一次 refresh */
let refreshPromise: Promise<string | null> | null = null;

/** 鉴权失效只提示 / 跳转一次，避免并发请求叠多个「未登录」 */
let unauthorizedHandled = false;

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

/** 是否视为未登录 / token 失效（业务码、HTTP 状态或文案） */
function isAuthFailure(
  bizCode?: number,
  status?: number,
  message?: string
): boolean {
  if (bizCode === 401 || status === 401) return true;
  const m = String(message || '').trim();
  if (!m) return false;
  return /未登录|登录失效|登录已失效|未认证|token\s*(expired|invalid)|unauthorized|unauthenticated/i.test(
    m
  );
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

export function setRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
  }
}

export function getRefreshToken() {
  return localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
}

/** 持久化设备 ID（refresh 接口必填） */
export function getDeviceId() {
  let id = localStorage.getItem(AUTH_DEVICE_ID_STORAGE_KEY);
  if (id) return id;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    id = crypto.randomUUID();
  } else {
    id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
  localStorage.setItem(AUTH_DEVICE_ID_STORAGE_KEY, id);
  return id;
}

/** 登录 / refresh 成功后写入 access + refresh */
export function setAuthTokens(
  token: { access_token?: string; refresh_token?: string } | null
) {
  if (!token) {
    clearAuthSession();
    return;
  }
  // 新登录态允许下次失效时再提示一次
  unauthorizedHandled = false;
  if (token.access_token) {
    setAccessToken(token.access_token);
  }
  if (token.refresh_token) {
    setRefreshToken(token.refresh_token);
  }
}

/** 清登录态（保留 device_id） */
export function clearAuthSession() {
  setAccessToken(null);
  setRefreshToken(null);
}

function pickServerMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }
  const o = data as Record<string, unknown>;
  const msg = o.message ?? o.msg ?? o.error;
  return typeof msg === 'string' ? msg : undefined;
}

function isApiBasePayload(data: unknown): data is ApiEnvelope {
  return (
    data !== null &&
    typeof data === 'object' &&
    typeof (data as ApiEnvelope).code === 'number'
  );
}

function resolveFailMessage(error: AxiosError): {
  status?: number;
  message: string;
} {
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

function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function shouldSkipAuthRefresh(config?: RequestConfig) {
  if (!config) return true;
  if (config.skipAuthRefresh || config.__isRetryRequest) return true;
  const url = `${config.baseURL || ''}${config.url || ''}`;
  return /\/v1\/admin\/auth\/(login|logout|refresh-token|check-token)/.test(
    url
  );
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    // 直打 instance，避免依赖生成 auth 客户端造成循环引用
    const res = (await instance.post(
      '/v1/admin/auth/refresh-token',
      {
        refresh_token: refreshToken,
        device_id: getDeviceId()
      } satisfies AdminAPI.RefreshTokenRequest,
      {
        skipErrorHandler: true,
        skipAuthRefresh: true
      } as AxiosRequestConfig
    )) as AdminAPI.SysUserTokenEnvelope;

    const next = res.data?.token;
    if (!next?.access_token) return null;
    setAuthTokens(next);
    return next.access_token;
  } catch {
    return null;
  }
}

function failUnauthorized(
  error: RequestFailedError,
  silent: boolean
): Promise<never> {
  if (!unauthorizedHandled) {
    unauthorizedHandled = true;
    if (!silent) {
      // 清掉已叠出来的同类提示，只留一条
      Message.clear?.();
      Message.error(error.message || '未登录');
    }
    onUnauthorized?.();
  }
  return Promise.reject(error);
}

async function retryAfterRefresh(
  config: RequestConfig,
  error: RequestFailedError
): Promise<unknown> {
  const silent = config.skipErrorHandler === true;

  // 已判定失效并处理过：后续并发请求直接失败，不再重复 refresh / 弹窗
  if (unauthorizedHandled) {
    return Promise.reject(error);
  }

  if (shouldSkipAuthRefresh(config)) {
    return failUnauthorized(error, silent);
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const access = await refreshPromise;
  if (!access) {
    return failUnauthorized(error, silent);
  }

  const headers = AxiosHeaders.from(config.headers || {});
  headers.set('Authorization', `Bearer ${access}`);

  return instance.request({
    ...config,
    headers,
    __isRetryRequest: true
  } as AxiosRequestConfig);
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
  // Admin OpenAPI：除健康检查外业务接口要求透传 X-Request-ID
  if (!config.headers.get('X-Request-ID')) {
    config.headers.set('X-Request-ID', createRequestId());
  }
  if (!config.headers.get('X-Language')) {
    config.headers.set('X-Language', 'zh-CN');
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
        typeof data.message === 'string' && data.message
          ? data.message
          : '请求失败';
      const bizCode = data.code;
      const failed: RequestFailedError = {
        bizCode,
        message: msg,
        original: data
      };

      if (isAuthFailure(bizCode, undefined, msg)) {
        return retryAfterRefresh(cfg, failed);
      }

      if (isIpAccessDeniedError(failed)) {
        redirectToIpAccessDenied();
        return Promise.reject(failed);
      }

      if (!silent) {
        Message.error(msg);
      }

      return Promise.reject(failed);
    }

    return data;
  },
  (error: AxiosError) => {
    const cfg = (error.config || {}) as RequestConfig;
    const silent = cfg.skipErrorHandler === true;
    const { status, message } = resolveFailMessage(error);
    const failed: RequestFailedError = {
      status,
      message,
      original: error
    };

    if (isAuthFailure(undefined, status, message)) {
      return retryAfterRefresh(cfg, failed);
    }

    if (isIpAccessDeniedError(failed)) {
      redirectToIpAccessDenied();
      return Promise.reject(failed);
    }

    if (!silent) {
      Message.error(message);
    }

    return Promise.reject(failed);
  }
);

export const request = instance as Request;

export default request;
