import { AxiosHeaders, type AxiosAdapter } from 'axios';

import { createHttpClient } from './http-client';

describe('createHttpClient', () => {
  it('injects the configured base URL and bearer token', async () => {
    const adapter: AxiosAdapter = async (config) => ({
      config,
      data: { ok: true },
      headers: {},
      status: 200,
      statusText: 'OK'
    });

    const client = createHttpClient({
      baseURL: '/admin-api',
      getAccessToken: () => 'access-token',
      adapter
    });

    const response = await client.get('/health');
    const headers = AxiosHeaders.from(response.config.headers);

    expect(response.config.baseURL).toBe('/admin-api');
    expect(headers.get('Authorization')).toBe('Bearer access-token');
  });
});
