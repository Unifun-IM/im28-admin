import { AxiosHeaders, type AxiosAdapter } from 'axios';
import { vi } from 'vitest';

import request, {
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthSession,
  getDeviceId,
  setAccessToken,
  setAuthTokens,
  setRefreshToken
} from './request';

describe('request', () => {
  afterEach(() => {
    clearAuthSession();
  });

  it('injects bearer token from localStorage', async () => {
    setAccessToken('access-token');

    const adapter: AxiosAdapter = async (config) => ({
      config,
      data: { ok: true },
      headers: {},
      status: 200,
      statusText: 'OK'
    });

    const previous = request.defaults.adapter;
    request.defaults.adapter = adapter;
    request.defaults.baseURL = '/admin-api';

    try {
      const data = (await request.get('/health')) as { ok: boolean };
      expect(data).toEqual({ ok: true });
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('access-token');

      let authHeader: string | null = null;
      request.defaults.adapter = async (config) => {
        authHeader = AxiosHeaders.from(config.headers).get(
          'Authorization'
        ) as string;
        return {
          config,
          data: { ok: true },
          headers: {},
          status: 200,
          statusText: 'OK'
        };
      };
      await request.get('/health-2');
      expect(authHeader).toBe('Bearer access-token');
    } finally {
      request.defaults.adapter = previous;
    }
  });

  it('refreshes access token on biz 401 and retries once', async () => {
    setAuthTokens({
      access_token: 'old-access',
      refresh_token: 'refresh-1'
    });

    const previous = request.defaults.adapter;
    request.defaults.baseURL = '/';

    let businessHits = 0;
    request.defaults.adapter = async (config) => {
      const url = String(config.url || '');
      if (url.includes('/v1/admin/auth/refresh-token')) {
        return {
          config,
          data: {
            code: 0,
            message: 'ok',
            data: {
              token: {
                access_token: 'new-access',
                refresh_token: 'refresh-2'
              }
            }
          },
          headers: {},
          status: 200,
          statusText: 'OK'
        };
      }

      businessHits += 1;
      if (businessHits === 1) {
        return {
          config,
          data: { code: 401, message: 'unauthorized' },
          headers: {},
          status: 200,
          statusText: 'OK'
        };
      }

      const auth = AxiosHeaders.from(config.headers).get(
        'Authorization'
      ) as string;
      expect(auth).toBe('Bearer new-access');
      return {
        config,
        data: { code: 0, message: 'ok', data: { ok: true } },
        headers: {},
        status: 200,
        statusText: 'OK'
      };
    };

    try {
      const res = (await request.post('/v1/admin/users/list', {})) as {
        code: number;
        data?: { ok?: boolean };
      };
      expect(res.code).toBe(0);
      expect(res.data?.ok).toBe(true);
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('new-access');
      expect(localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBe(
        'refresh-2'
      );
      expect(getDeviceId()).toBeTruthy();
      expect(businessHits).toBe(2);
    } finally {
      request.defaults.adapter = previous;
    }
  });

  it('clears refresh token with clearAuthSession', () => {
    setAccessToken('a');
    setRefreshToken('r');
    clearAuthSession();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('shows unauthorized toast only once for concurrent auth failures', async () => {
    const { Message } = await import('@arco-design/web-react');
    const errorSpy = vi.spyOn(Message, 'error').mockImplementation(() => {});
    const clearSpy = vi
      .spyOn(Message, 'clear')
      .mockImplementation(() => {});

    setAccessToken('expired');
    // 无 refresh_token → refresh 直接失败

    const previous = request.defaults.adapter;
    request.defaults.baseURL = '/';
    request.defaults.adapter = async (config) => ({
      config,
      data: { code: 100003, message: '未登录' },
      headers: {},
      status: 200,
      statusText: 'OK'
    });

    try {
      const results = await Promise.allSettled([
        request.post('/v1/admin/users/list', {}),
        request.post('/v1/admin/groups/list', {}),
        request.post('/v1/admin/platform/settings/get', {})
      ]);
      expect(results.every((r) => r.status === 'rejected')).toBe(true);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith('未登录');
    } finally {
      request.defaults.adapter = previous;
      errorSpy.mockRestore();
      clearSpy.mockRestore();
    }
  });
});
