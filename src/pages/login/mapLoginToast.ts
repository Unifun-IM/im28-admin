/**
 * 登录 Toast 映射 — Figma 979:39539
 * 只返回前端文案，不透出后端 message
 */
import type { RequestFailedError } from '@shared/api/request';

export type LoginLocaleBag = Record<string, string>;

export type LoginErrorKind =
  | 'login'
  | 'passwordChange'
  | 'gaBind'
  | 'gaVerify'
  | 'gaSetup';

function asFailed(error: unknown): RequestFailedError | undefined {
  if (!error || typeof error !== 'object') return undefined;
  return error as RequestFailedError;
}

function signalText(error: unknown): string {
  const e = asFailed(error);
  return `${e?.message || ''} ${e?.status ?? ''} ${e?.bizCode ?? ''}`.toLowerCase();
}

function isNetworkError(error: unknown): boolean {
  const e = asFailed(error);
  if (!e) return true;
  if (e.status === undefined && e.bizCode === undefined) return true;
  const s = signalText(error);
  return /network|timeout|econnaborted|failed to fetch|网络/.test(s);
}

/**
 * 根据错误类型选择前端 Toast 文案（绝不回传后端原文）
 */
export function mapLoginToast(
  error: unknown,
  kind: LoginErrorKind,
  t: LoginLocaleBag
): string {
  const s = signalText(error);

  if (isNetworkError(error) && kind === 'login') {
    return t['login.msg.network'];
  }

  if (kind === 'login') {
    const e = asFailed(error);
    // 100031：当前 IP 不在白名单 / 不允许访问后台
    if (
      e?.bizCode === 100031 ||
      /100031|不允许访问|ip.*(不允许|not allowed|denied|whitelist|forbidden)|current ip/.test(
        s
      )
    ) {
      return t['login.msg.ipDenied'];
    }
    if (/禁用|disabled|forbidden/.test(s)) {
      return t['login.msg.accountDisabled'];
    }
    if (/锁定|locked/.test(s) && !/过多|too many|rate/.test(s)) {
      return t['login.msg.accountLocked'];
    }
    if (/过多|too many|rate.?limit|throttle|频繁/.test(s)) {
      return t['login.msg.loginTooMany'];
    }
    if (isNetworkError(error)) {
      return t['login.msg.network'];
    }
    return t['login.msg.accountPwdErr'];
  }

  if (kind === 'passwordChange') {
    if (/历史|history|reused|previously used/.test(s)) {
      return t['login.msg.pwdHistory'];
    }
    if (isNetworkError(error)) {
      return t['login.msg.network'];
    }
    return t['login.msg.pwdChangeFail'];
  }

  if (kind === 'gaSetup') {
    if (/过期|expir|invalid.*token|失效/.test(s)) {
      return t['login.msg.qrExpired'];
    }
    return t['login.msg.setupFail'];
  }

  if (kind === 'gaBind') {
    if (/过期|expir|失效/.test(s)) return t['login.msg.codeExpired'];
    if (/已使用|reused|already used|replay/.test(s)) {
      return t['login.msg.codeUsed'];
    }
    if (/错误|invalid|incorrect|wrong/.test(s)) {
      return t['login.msg.codeWrong'];
    }
    if (isNetworkError(error)) return t['login.msg.network'];
    return t['login.msg.bindFail'];
  }

  // gaVerify
  if (/未绑定|not bound|not.*setup|未完成安全/.test(s)) {
    return t['login.msg.gaNotBound'];
  }
  if (/过期|expir|失效/.test(s)) return t['login.msg.codeExpired'];
  if (/错误|invalid|incorrect|wrong/.test(s)) {
    return t['login.msg.codeWrong'];
  }
  if (isNetworkError(error)) return t['login.msg.network'];
  return t['login.msg.verifyFail'];
}
