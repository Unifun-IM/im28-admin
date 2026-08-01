import { type PropsWithChildren, useEffect, useMemo } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import enUS from '@arco-design/web-react/es/locale/en-US';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';

import { globalStore } from '@entities/global-state';
import {
  clearAuthSession,
  setUnauthorizedHandler
} from '@shared/api/request';
import { postV1AdminAuthMe } from '@shared/api/admin/auth';
import { GlobalContext } from '@shared/lib/global-context';
import changeTheme from '@shared/lib/changeTheme';
import checkLogin from '@shared/lib/checkLogin';
import useStorage from '@shared/lib/useStorage';

function getArcoLocale(lang: string) {
  switch (lang) {
    case 'zh-CN':
      return zhCN;
    case 'en-US':
      return enUS;
    default:
      return zhCN;
  }
}

function bootstrapLoggedInShell() {
  if (typeof window === 'undefined' || !checkLogin()) return;
  globalStore.updateUserInfo({
    userLoading: true,
    userInfo: {
      ...globalStore.userInfo,
      permissions: {}
    }
  });
}

bootstrapLoggedInShell();

export function AppProviders({ children }: PropsWithChildren) {
  const [lang, setLang] = useStorage('arco-lang', 'zh-CN');
  const [theme, setTheme] = useStorage('arco-theme', 'light');

  const contextValue = useMemo(
    () => ({
      lang,
      setLang,
      theme,
      setTheme
    }),
    [lang, setLang, theme, setTheme]
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem('userStatus');
      clearAuthSession();
      if (window.location.pathname.replace(/\//g, '') !== 'login') {
        window.location.pathname = '/login';
      }
    });
  }, []);

  useEffect(() => {
    if (checkLogin()) {
      postV1AdminAuthMe()
        .then((res) => {
          globalStore.updateUserInfo({
            userInfo: {
              sys_user: res.data?.sys_user,
              rbac: res.data?.rbac,
              permissions: {}
            },
            userLoading: false
          });
        })
        .catch(() => {
          globalStore.updateUserInfo({ userLoading: false });
        });
    } else if (window.location.pathname.replace(/\//g, '') !== 'login') {
      window.location.pathname = '/login';
    }
  }, []);

  useEffect(() => {
    changeTheme(theme, globalStore.settings.themeColor);
  }, [theme]);

  return (
    <ConfigProvider
      locale={getArcoLocale(lang)}
      componentConfig={{
        Modal: {
          closable: false
        }
      }}
    >
      <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>
    </ConfigProvider>
  );
}

export default AppProviders;
