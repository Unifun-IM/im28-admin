import type { AxiosAdapter } from 'axios';

import { createHttpClient } from '@shared/api';

import { fetchCurrentUser } from './current-user.api';

describe('fetchCurrentUser', () => {
  it('rejects invalid current-user payloads before updating entity state', async () => {
    const adapter: AxiosAdapter = async (config) => ({
      config,
      data: '<html>vite fallback</html>',
      headers: {},
      status: 200,
      statusText: 'OK'
    });

    const client = createHttpClient({
      baseURL: '/admin-api',
      adapter
    });

    await expect(fetchCurrentUser(client)).rejects.toThrow('Invalid current user payload');
  });
});
