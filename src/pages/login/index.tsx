import React, { useEffect } from 'react';
import loginEffect from './assets/login-effect.svg';
import loginLogo from './assets/login-logo.svg';
import LoginForm from './form';
import './login.less';

/**
 * 登录页 — Figma 602:35261
 * 左栏 524 / padding 64；右栏居中表单 360
 */
function Login() {
  useEffect(() => {
    document.body.setAttribute('arco-theme', 'light');
  }, []);

  return (
    <div className="use-login-page flex h-screen bg-[var(--color-bg-1,#f7f8fa)]">
      <div
        className="use-login-banner relative box-border flex h-full w-[524px] shrink-0 overflow-hidden p-[64px] text-white max-[900px]:hidden"
        style={{
          /* Figma：双层径向 SVG，无深色底渐变 */
          backgroundColor: '#8380fe',
          backgroundImage: [
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 524 900' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><g transform='matrix(-97.109 78.052 13.528 -251.76 624.59 224.98)' opacity='1'><rect id='q' height='51.829' width='54.748' fill='url(%23g)' shape-rendering='crispEdges'/><use href='%23q' transform='scale(1 -1)'/><use href='%23q' transform='scale(-1 1)'/><use href='%23q' transform='scale(-1 -1)'/></g><defs><linearGradient id='g' gradientUnits='userSpaceOnUse' x2='5' y2='5'><stop stop-color='rgba(123,97,255,1)' offset='0.16192'/><stop stop-color='rgba(148,159,255,0.5)' offset='0.58096'/><stop stop-color='rgba(172,222,255,0)' offset='1'/></linearGradient></defs></svg>\")",
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 524 900' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><g transform='matrix(29.111 127.03 -41.603 88.89 70.949 -251.95)' opacity='1'><rect id='q' height='82.476' width='107.26' fill='url(%23g)' shape-rendering='crispEdges'/><use href='%23q' transform='scale(1 -1)'/><use href='%23q' transform='scale(-1 1)'/><use href='%23q' transform='scale(-1 -1)'/></g><defs><linearGradient id='g' gradientUnits='userSpaceOnUse' x2='5' y2='5'><stop stop-color='rgba(131,127,254,1)' offset='0.335'/><stop stop-color='rgba(143,166,255,1)' offset='0.6675'/><stop stop-color='rgba(155,205,255,1)' offset='1'/></linearGradient></defs></svg>\")"
          ].join(', ')
        }}
      >
        <div
          className="pointer-events-none absolute inset-[-86.3%_-157.88%_-62.86%_-189.21%] flex items-center justify-center"
          aria-hidden
        >
          <img
            src={loginEffect}
            alt=""
            className="h-full w-full max-w-none rotate-[-37.89deg] object-cover"
          />
        </div>
        <div className="relative z-[1] flex h-full w-[396px] flex-col justify-between">
          <div className="flex items-center gap-[16px]">
            <img src={loginLogo} alt="" className="block size-[24px]" />
            <span className="text-[20px] font-bold leading-[28px] text-white">
              IM-28 Management
            </span>
          </div>
          <div className="flex flex-col gap-[21px]">
            <h1 className="m-0 text-[31.5px] font-semibold leading-[39.375px] text-white">
              Elevate your
              <br />
              communication management
            </h1>
            <p className="m-0 max-w-[336px] text-[12.25px] leading-[19.906px] text-white/80">
              A comprehensive backend to manage accounts, control precise permissions,
              and audit system operations securely.
            </p>
          </div>
          <div className="flex h-[14px] items-center gap-[14px] text-[10.5px] font-medium leading-[14px] text-white/70">
            <span>© 2026 NexIM Corp</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-1,#f7f8fa)] px-[24px] pb-[40px]">
        <div className="w-[360px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

Login.displayName = 'LoginPage';

export default Login;
