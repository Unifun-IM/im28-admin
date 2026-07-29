import { AxiosHeaders, type AxiosAdapter } from 'axios';

import request, { AUTH_TOKEN_STORAGE_KEY, setAccessToken } from './request';

describe('request', () => {
  afterEach(() => {
    setAccessToken(null);
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

      // 验证最近一次请求带上了 Authorization（通过 adapter 侧无法直接断言，这里再打一枪取 config）
      let authHeader: string | null = null;
      request.defaults.adapter = async (config) => {
        authHeader = AxiosHeaders.from(config.headers).get('Authorization') as string;
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
});
