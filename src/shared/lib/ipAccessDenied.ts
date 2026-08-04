/**
 * IP 白名单拦截 — AdminAPI code 100031
 * 任意接口（含登录）命中后由 axios 全局拦截器跳转 /ip-denied
 */
export const IP_ACCESS_DENIED_CODE = 100031;

type FailedLike = {
  bizCode?: number;
  message?: string;
  original?: unknown;
};

function asFailed(error: unknown): FailedLike | undefined {
  if (!error || typeof error !== 'object') return undefined;
  return error as FailedLike;
}

function pickBizCode(error: unknown): number | undefined {
  const e = asFailed(error);
  if (typeof e?.bizCode === 'number') return e.bizCode;

  const original = e?.original;
  if (original && typeof original === 'object') {
    const o = original as Record<string, unknown>;
    if (typeof o.code === 'number') return o.code;
    const data = (o as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object' && typeof (data as { code?: unknown }).code === 'number') {
      return (data as { code: number }).code;
    }
  }
  return undefined;
}

export function isIpAccessDeniedError(error: unknown): boolean {
  if (pickBizCode(error) === IP_ACCESS_DENIED_CODE) return true;
  const e = asFailed(error);
  const s = `${e?.message || ''} ${e?.bizCode ?? ''}`.toLowerCase();
  return /100031|不允许访问|ip.*(不允许|not allowed|denied|whitelist)|current ip/.test(
    s
  );
}

/** 跳转非法访问页（全局拦截器用）；IP 由页面自行用 ipify 获取 */
export function redirectToIpAccessDenied() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.replace(/\/+$/, '') === '/ip-denied') return;
  window.location.assign('/ip-denied');
}
