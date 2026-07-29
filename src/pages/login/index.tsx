import React, { useEffect } from 'react';
import Logo from '@shared/assets/logo.svg?react';
import LoginForm from './form';

function Login() {
  useEffect(() => {
    document.body.setAttribute('arco-theme', 'light');
  }, []);

  return (
    <div className="flex h-screen bg-[#f7f8fa]">
      <div
        className="box-border flex w-[524px] shrink-0 flex-col justify-between px-16 py-16 text-white max-[900px]:hidden"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(123, 97, 255, 0.9), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(99, 92, 255, 0.85), transparent 50%), linear-gradient(160deg, #2b2a6e 0%, #4b48c8 45%, #635cff 100%)'
        }}
      >
        <div className="flex items-center gap-4 text-xl font-semibold [&_svg]:h-6 [&_svg]:w-6">
          <Logo />
          <span>IM-28 Management</span>
        </div>
        <div>
          <h1 className="m-0 text-[32px] font-semibold leading-[1.25]">
            Elevate your
            <br />
            communication management
          </h1>
          <p className="mt-[21px] max-w-[336px] text-xs leading-[1.6] text-white/80">
            A comprehensive backend to manage accounts, control precise permissions,
            and audit system operations securely.
          </p>
        </div>
        <div className="text-[11px] text-white/70">
          © 2026 NexIM Corp · Privacy Policy
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-[360px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
Login.displayName = 'LoginPage';

export default Login;
