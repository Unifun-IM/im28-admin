import { type PropsWithChildren, useEffect, useMemo } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import enUS from '@arco-design/web-react/es/locale/en-US';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';

import { globalStore } from '@entities/global-state';
import { systemSettingsStore } from '@entities/system-settings';
import {
  clearAuthSession,
  setUnauthorizedHandler
} from '@shared/api/request';
import { postV1AdminAuthMe } from '@shared/api/admin/auth';
import { GlobalContext } from '@shared/lib/global-context';
import changeTheme from '@shared/lib/changeTheme';
import checkLogin from '@shared/lib/checkLogin';
import {
  isIpAccessDeniedError,
  redirectToIpAccessDenied
} from '@shared/lib/ipAccessDenied';
import useStorage from '@shared/lib/useStorage';

function isPublicPath(pathname: string) {
  const p = pathname.replace(/\/+$/, '') || '/';
  return p === '/login' || p === '/ip-denied';
}

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
      systemSettingsStore.clear();
      if (!isPublicPath(window.location.pathname)) {
        window.location.pathname = '/login';
      }
    });
  }, []);

  useEffect(() => {
    if (checkLogin()) {
      // 登录后并行：当前用户 + 系统参数（品牌 / 默认语言 / 时间格式）
      void systemSettingsStore.fetch().then((setting) => {
        if (!setting) return;
        // 顶栏语言是个人偏好（arco-lang）；已有本地值时不强制覆盖
        const stored = localStorage.getItem('arco-lang');
        if (stored === 'zh-CN' || stored === 'en-US') return;
        const nextLang = systemSettingsStore.defaultLanguage;
        if (nextLang === 'zh-CN' || nextLang === 'en-US') {
          setLang(nextLang);
        }
      });

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
        .catch((error) => {
          if (isIpAccessDeniedError(error)) {
            redirectToIpAccessDenied();
            return;
          }
          globalStore.updateUserInfo({ userLoading: false });
        });
    } else if (!isPublicPath(window.location.pathname)) {
      window.location.pathname = '/login';
    }
    // 仅启动时拉一次；勿依赖 setLang（历史实现每次渲染都会变，导致切语言被系统默认打回）
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once
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
