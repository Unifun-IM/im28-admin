import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import checkLogin from '@shared/lib/checkLogin';
import useLocale from '@shared/lib/useLocale';
import LoginBannerBg from '@assets/login/login-banner-bg.svg?react';
import loginLogo from '@assets/login/login-logo.svg';
import LoginForm from './form';
import './login.less';

/**
 * 登录页 — Figma 602:35261
 * 左栏背景：Frame 671 导出图（524×900）
 */
function Login() {
  const t = useLocale();

  useEffect(() => {
    document.body.setAttribute('arco-theme', 'light');
    document.documentElement.classList.remove('dark');
  }, []);

  // 已登录访问 /login → 回首页
  if (checkLogin()) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <div className="use-login-page flex h-screen bg-[var(--color-bg-1,#f7f8fa)]">
      <div className="use-login-banner relative box-border flex h-full w-[524px] shrink-0 overflow-hidden p-[64px] text-white max-[900px]:hidden">
        <LoginBannerBg
          className="pointer-events-none absolute inset-0 block size-full max-w-none"
          aria-hidden
          focusable="false"
        />
        <div className="relative z-[1] flex h-full w-[396px] flex-col justify-between">
          <div className="flex items-center gap-[16px]">
            <img src={loginLogo} alt="" className="block size-[24px]" />
            <span className="text-[20px] font-bold leading-[28px] text-[var(--color-text-white)]">
              {t['login.panel.brand']}
            </span>
          </div>
          <div className="flex flex-col gap-[21px]">
            <h1 className="m-0 text-[31.5px] font-semibold leading-[39.375px] text-[var(--color-text-white)]">
              {t['login.panel.titleLine1']}
              <br />
              {t['login.panel.titleLine2']}
            </h1>
            <p className="m-0 max-w-[336px] text-[12.25px] leading-[19.906px] text-[var(--color-text-white)] opacity-80">
              {t['login.panel.desc']}
            </p>
          </div>
          <div className="flex h-[14px] items-center gap-[14px] text-[10.5px] font-medium leading-[14px] text-[var(--color-text-white)] opacity-70">
            <span>{t['login.panel.copyright']}</span>
            <span>•</span>
            <span>{t['login.panel.privacy']}</span>
          </div>
        </div>
      </div>

      <div className="box-border flex min-w-0 flex-1 items-center justify-center bg-[var(--color-bg-1)] px-[24px] pb-[40px]">
        <div className="w-full max-w-[360px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

Login.displayName = 'LoginPage';

export default Login;
