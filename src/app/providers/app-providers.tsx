import { type PropsWithChildren, useEffect, useMemo } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import enUS from '@arco-design/web-react/es/locale/en-US';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';

import { globalStore } from '@entities/global-state';
import {
  setAccessToken,
  setUnauthorizedHandler
} from '@shared/api/request';
import { getApiUserUserInfo } from '@shared/api/user';
import { GlobalContext } from '@shared/lib/global-context';
import changeTheme from '@shared/lib/changeTheme';
import checkLogin from '@shared/lib/checkLogin';
import useStorage from '@shared/lib/useStorage';

import '@shared/mock';

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
      setAccessToken(null);
      if (window.location.pathname.replace(/\//g, '') !== 'login') {
        window.location.pathname = '/login';
      }
    });
  }, []);

  useEffect(() => {
    if (checkLogin()) {
      globalStore.updateUserInfo({ userLoading: true });
      getApiUserUserInfo()
        .then((userInfo) => {
          globalStore.updateUserInfo({
            userInfo: {
              permissions: {},
              ...userInfo
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
      componentConfig={{
        Card: { bordered: false },
        List: { bordered: false },
        Table: { border: false }
      }}
      locale={getArcoLocale(lang || 'zh-CN')}
    >
      <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>
    </ConfigProvider>
  );
}
