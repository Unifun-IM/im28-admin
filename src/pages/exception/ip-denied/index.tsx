import React, { useEffect, useState } from 'react';

/**
 * IP 非白名单非法访问拦截页 — Figma 1050:22903
 * 触发：登录 / 接口业务码 100031；页面错误码固定展示 403
 * IP 一律由 ipify 获取展示
 */
function IpDeniedPage() {
  const [ip, setIp] = useState('—');

  useEffect(() => {
    document.body.setAttribute('arco-theme', 'dark');
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data: { ip?: string }) => {
        if (!cancelled && data?.ip) setIp(data.ip);
      })
      .catch(() => {
        if (!cancelled) setIp('—');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="box-border flex h-screen w-screen flex-col items-center justify-center bg-[#0a0a0a] p-10 text-white">
      <div className="box-border flex h-full w-full flex-col items-center justify-center gap-[45px] border-[6px] border-solid border-[#e20404] px-6 py-10">
        <h1 className="m-0 text-center text-[clamp(48px,8vw,100px)] font-bold leading-none text-[#e20404]">
          FBI WARNING
        </h1>

        <div className="h-px w-full max-w-[939px] bg-[rgba(255,255,255,0.12)]" />

        <div className="flex w-full max-w-[760px] flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <p className="m-0 text-[clamp(28px,4vw,36px)] font-bold leading-[44px] text-white">
              IP地址访问受限
            </p>
            <p className="m-0 text-[20px] leading-7 text-white">
              很抱歉，您的IP地址{' '}
              <span className="text-[#e20404]">{ip}</span> 访问受限
            </p>
            <p className="m-0 text-[20px] leading-7 text-white/60">
              We apologize that access from your IP address{' '}
              <span className="text-[#e20404]">{ip}</span> is currently
              restricted.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex flex-col gap-2 text-left">
                <span className="text-[24px] leading-8 text-white">错误代码</span>
                <span className="text-[20px] leading-7 text-white/60">
                  Error Code
                </span>
              </div>
              <span className="text-[24px] leading-8 text-[#e20404]">403</span>
            </div>

            <div className="h-px w-full bg-[rgba(255,255,255,0.12)]" />

            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex flex-col gap-2 text-left">
                <span className="text-[24px] leading-8 text-white">受限原因</span>
                <span className="text-[20px] leading-7 text-white/60">
                  Reason
                </span>
              </div>
              <span className="text-[24px] leading-8 text-[#e20404]">
                IP Not Whitelisted
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-4 text-center text-[16px] leading-6">
            <p className="m-0 text-white">
              如需开通访问权限，请联系管理员或我司技术支持协助。
            </p>
            <p className="m-0 text-white/60">
              Should you require access, please feel free to reach out to our
              administrator or technical support team for further assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

IpDeniedPage.displayName = 'IpDeniedPage';

export default IpDeniedPage;
