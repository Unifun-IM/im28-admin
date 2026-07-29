import React, { useEffect } from 'react';
import loginEffect from './assets/login-effect.svg';
import loginLogo from './assets/login-logo.svg';
import LoginForm from './form';

/**
 * 登录页 — Figma 602:35197
 * 左栏 524 / padding 64；右栏居中表单 360
 */
function Login() {
  useEffect(() => {
    document.body.setAttribute('arco-theme', 'light');
  }, []);

  return (
    <div className="use-login-page flex h-screen bg-[var(--color-bg-1,#f7f8fa)]">
      <div
        className="relative box-border flex h-full w-[524px] shrink-0 overflow-hidden p-[64px] text-white max-[900px]:hidden"
        style={{
          backgroundImage: [
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 524 900' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><g transform='matrix(-97.109 78.052 13.528 -251.76 624.59 224.98)'><rect height='51.829' width='54.748' fill='url(%23g)'/><use href='%23q' transform='scale(1 -1)'/><use href='%23q' transform='scale(-1 1)'/><use href='%23q' transform='scale(-1 -1)'/></g><defs><linearGradient id='g' gradientUnits='userSpaceOnUse' x2='5' y2='5'><stop stop-color='rgba(123,97,255,1)' offset='0.162'/><stop stop-color='rgba(148,159,255,0.5)' offset='0.581'/><stop stop-color='rgba(172,222,255,0)' offset='1'/></linearGradient><rect id='q' height='51.829' width='54.748' fill='url(%23g)'/></defs></svg>\")",
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 524 900' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><g transform='matrix(29.111 127.03 -41.603 88.89 70.949 -251.95)'><rect height='82.476' width='107.26' fill='url(%23g)'/><use href='%23q' transform='scale(1 -1)'/><use href='%23q' transform='scale(-1 1)'/><use href='%23q' transform='scale(-1 -1)'/></g><defs><linearGradient id='g' gradientUnits='userSpaceOnUse' x2='5' y2='5'><stop stop-color='rgba(131,127,254,1)' offset='0.335'/><stop stop-color='rgba(143,166,255,1)' offset='0.668'/><stop stop-color='rgba(155,205,255,1)' offset='1'/></linearGradient><rect id='q' height='82.476' width='107.26' fill='url(%23g)'/></defs></svg>\")",
            'linear-gradient(160deg, #2b2a6e 0%, #4b48c8 45%, #635cff 100%)'
          ].join(', ')
        }}
      >
        <img
          src={loginEffect}
          alt=""
          className="pointer-events-none absolute left-[-80%] top-[-40%] h-[180%] w-[220%] max-w-none rotate-[-38deg] object-cover opacity-90"
          aria-hidden
        />
        <div className="relative z-[1] flex h-full w-[396px] flex-col justify-between">
          <div className="flex items-center gap-[16px]">
            <img src={loginLogo} alt="" className="block size-[24px]" />
            <span className="text-[20px] font-semibold leading-[28px] text-white">
              IM-28 Management
            </span>
          </div>
          <div className="flex flex-col gap-[21px]">
            <h1 className="m-0 text-[32px] font-semibold leading-[40px] text-white">
              Elevate your
              <br />
              communication management
            </h1>
            <p className="m-0 max-w-[336px] text-[12px] leading-[20px] text-white/80">
              A comprehensive backend to manage accounts, control precise permissions,
              and audit system operations securely.
            </p>
          </div>
          <div className="flex items-center gap-[14px] text-[10.5px] font-medium leading-[14px] text-white/70">
            <span>© 2026 NexIM Corp</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-[24px] pb-[40px]">
        <div className="w-[360px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

Login.displayName = 'LoginPage';

export default Login;
