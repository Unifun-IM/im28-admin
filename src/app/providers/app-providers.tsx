import { type PropsWithChildren, useEffect, useMemo } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import enUS from '@arco-design/web-react/es/locale/en-US';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import axios from 'axios';

import { globalStore, type UserInfo } from '@entities/global-state';
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
    if (checkLogin()) {
      globalStore.updateUserInfo({ userLoading: true });
      axios.get('/api/user/userInfo').then((res) => {
        globalStore.updateUserInfo({
          userInfo: res.data as UserInfo,
          userLoading: false
        });
      });
    } else if (window.location.pathname.replace(/\//g, '') !== 'login') {
      window.location.pathname = '/login';
    }
  }, []);

  useEffect(() => {
    changeTheme(theme);
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
