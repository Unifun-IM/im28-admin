import { type PropsWithChildren, useMemo } from 'react';

import { ConfigProvider } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import {
  CurrentUserProvider,
  CurrentUserStore,
  fetchCurrentUser
} from '@entities/current-user';
import { createHttpClient } from '@shared/api';

function getAccessToken() {
  return window.localStorage.getItem('im-admin.access-token');
}

export function AppProviders({ children }: PropsWithChildren) {
  const currentUserStore = useMemo(() => {
    const httpClient = createHttpClient({
      baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL ?? '/api/admin',
      getAccessToken
    });

    return new CurrentUserStore(() => fetchCurrentUser(httpClient));
  }, []);

  return (
    <ConfigProvider
      componentConfig={{
        Card: {
          bordered: false
        },
        Table: {
          border: false
        }
      }}
      locale={zhCN}
    >
      <CurrentUserProvider store={currentUserStore}>{children}</CurrentUserProvider>
    </ConfigProvider>
  );
}
