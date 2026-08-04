/** IP 白名单拦截 — AdminAPI code 100031 */
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

export function isIpAccessDeniedError(error: unknown): boolean {
  const e = asFailed(error);
  if (e?.bizCode === IP_ACCESS_DENIED_CODE) return true;
  const s = `${e?.message || ''} ${e?.bizCode ?? ''}`.toLowerCase();
  return /100031|不允许访问|ip.*(不允许|not allowed|denied|whitelist)|current ip/.test(
    s
  );
}

/** 跳转非法访问页（拦截器等非 React 场景）；IP 由页面自行用 ipify 获取 */
export function redirectToIpAccessDenied() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.replace(/\/+$/, '') === '/ip-denied') return;
  window.location.assign('/ip-denied');
}
