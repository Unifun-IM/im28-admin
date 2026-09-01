import React, { useEffect, useState } from 'react';

/**
 * IP 非白名单非法访问拦截页 — Figma 1050:22903
 * 触发：任意接口业务码 100031（axios 全局拦截）
 * 页面错误码固定展示 403
 *
 * IP 来源：当前站点 /cdn-cgi/trace
 */
function IpDeniedPage() {
  const [ip, setIp] = useState('—');

  useEffect(() => {
    document.body.setAttribute('arco-theme', 'dark');
    document.documentElement.classList.add('dark');

    return () => {
      document.body.removeAttribute('arco-theme');
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchClientIp = async () => {
      try {
        const response = await fetch('/cdn-cgi/trace', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            Accept: 'text/plain'
          }
        });

        if (!response.ok) {
          throw new Error(`Trace request failed: ${response.status}`);
        }

        const traceText = await response.text();

        const traceData = Object.fromEntries(
          traceText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const separatorIndex = line.indexOf('=');

              if (separatorIndex === -1) {
                return [line, ''];
              }

              return [
                line.slice(0, separatorIndex),
                line.slice(separatorIndex + 1)
              ];
            })
        );

        const clientIp = traceData.ip?.trim();

        setIp(clientIp || '—');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error('Failed to fetch client IP:', error);
        setIp('—');
      }
    };

    void fetchClientIp();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="box-border flex h-screen w-screen flex-col items-center justify-center bg-arco-bg-black p-10 text-arco-text-white">
      <div className="box-border flex h-full w-full flex-col items-center justify-center gap-[45px] border-[6px] border-solid border-arco-danger px-6 py-10">
        <h1 className="m-0 text-center text-[48px] font-bold leading-none text-arco-danger md:text-[72px] xl:text-[100px]">
          FBI WARNING
        </h1>

        <div className="h-px w-full max-w-[939px] bg-arco-border-inverse" />

        <div className="flex w-full max-w-[760px] flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <p className="m-0 text-[28px] font-bold leading-[44px] text-arco-text-white md:text-[36px]">
              IP地址访问受限
            </p>

            <p className="m-0 text-page-title text-arco-text-white">
              很抱歉，您的IP地址 <span className="text-arco-danger">{ip}</span>{' '}
              访问受限
            </p>

            <p className="m-0 text-page-title text-arco-text-inverse-subtle">
              We apologize that access from your IP address{' '}
              <span className="text-arco-danger">{ip}</span> is currently
              restricted.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex flex-col gap-2 text-left">
                <span className="text-[24px] leading-8 text-arco-text-white">
                  错误代码
                </span>
                <span className="text-page-title text-arco-text-inverse-subtle">
                  Error Code
                </span>
              </div>

              <span className="text-[24px] leading-8 text-arco-danger">
                403
              </span>
            </div>

            <div className="h-px w-full bg-arco-border-inverse" />

            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex flex-col gap-2 text-left">
                <span className="text-[24px] leading-8 text-arco-text-white">
                  受限原因
                </span>
                <span className="text-page-title text-arco-text-inverse-subtle">
                  Reason
                </span>
              </div>

              <span className="text-right text-[24px] leading-8 text-arco-danger">
                IP Not Whitelisted
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-4 text-center text-title">
            <p className="m-0 text-arco-text-white">
              如需开通访问权限，请联系管理员或我司技术支持协助。
            </p>

            <p className="m-0 text-arco-text-inverse-subtle">
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
