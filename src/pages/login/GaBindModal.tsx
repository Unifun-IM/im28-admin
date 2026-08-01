import React, { useEffect, useState } from 'react';
import { Button, Input, Message, Modal, VerificationCode } from '@arco-design/web-react';

import useLocale from '@shared/lib/useLocale';

import copyIcon from './assets/icon-copy.svg';
import locale from './locale';

export type GaBindModalProps = {
  visible: boolean;
  loading?: boolean;
  /** 校验失败时递增，用于清空 OTP */
  errorTick?: number;
  /**
   * 首次强制绑定：不可跳过；左侧按钮为「退出登录」
   * Figma 602:35484
   */
  mandatory?: boolean;
  /** 手动绑定密钥 */
  secret?: string;
  /** 二维码图片 URL */
  qrUrl?: string;
  onCancel: () => void;
  onOk: (code: string) => void;
};

/** 绑定 GA 验证码弹窗 — Figma 602:35484 */
export default function GaBindModal({
  visible,
  loading,
  errorTick = 0,
  mandatory = false,
  secret = '',
  qrUrl,
  onCancel,
  onOk
}: GaBindModalProps) {
  const t = useLocale(locale);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'error' | undefined>();
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    if (visible) {
      setCode('');
      setStatus(undefined);
      setQrFailed(false);
    }
  }, [visible]);

  useEffect(() => {
    setQrFailed(false);
  }, [qrUrl]);

  useEffect(() => {
    if (!errorTick) return;
    setCode('');
    setStatus('error');
  }, [errorTick]);

  const submit = (value: string) => {
    if (loading) return;
    if (!value) {
      Message.warning(t['login.msg.codeEmpty']);
      return;
    }
    if (value.length < 6 || !/^\d{6}$/.test(value)) {
      Message.warning(t['login.msg.codeFormat']);
      return;
    }
    setStatus(undefined);
    onOk(value);
  };

  const copySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret.replace(/\s/g, ''));
      Message.success(t['login.msg.secretCopied']);
    } catch {
      Message.error(t['login.msg.secretCopyFail']);
    }
  };

  return (
    <Modal
      className="use-login-ga-modal"
      wrapClassName="use-login-ga-modal-wrap"
      visible={visible}
      title={null}
      footer={null}
      closable={false}
      maskClosable={false}
      escToExit={!mandatory}
      unmountOnExit
      onCancel={mandatory ? undefined : onCancel}
      afterClose={() => {
        setCode('');
        setStatus(undefined);
      }}
      style={{ width: 480 }}
    >
      <div className="box-border px-[24px] pb-[12px] pt-[24px]">
        <div className="text-[20px] font-medium leading-[28px] text-[var(--color-text-1,#1d2129)]">
          绑定GA验证码
        </div>
        <div className="text-[12px] leading-[20px] text-[var(--color-text-3,#86909c)]">
          使用 Google Authenticator 或 Authy 扫描下面的二维码。
        </div>
      </div>

      <div className="box-border flex flex-col gap-[24px] px-[24px] py-[12px]">
        <div className="flex justify-center">
          <div className="box-border size-[142px] rounded-[11px] border border-solid border-[#e5e7eb] bg-[#f7f8fa] p-[15px]">
            {qrUrl && !qrFailed ? (
              <img
                src={qrUrl}
                alt="GA QR"
                className="size-full object-contain"
                onError={() => {
                  setQrFailed(true);
                  Message.error(t['login.msg.qrLoadFail']);
                }}
              />
            ) : (
              <div className="flex h-[112px] w-full items-center justify-center border border-dashed border-[#99a1af] bg-[#e5e7eb] text-[10.5px] leading-[14px] text-[#6b7280]">
                {qrFailed ? '二维码加载失败' : '二维码加载中'}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <div className="text-[12px] font-medium leading-[18px] text-[var(--color-text-1,#1d2129)]">
            手动输入密钥绑定
          </div>
          <Input
            className="use-login-secret"
            readOnly
            value={secret}
            suffix={
              <button
                type="button"
                className="inline-flex size-[14px] cursor-pointer border-0 bg-transparent p-0"
                onClick={copySecret}
                aria-label="复制密钥"
              >
                <img src={copyIcon} alt="" className="block size-[14px]" />
              </button>
            }
          />
        </div>

        <div className="flex flex-col gap-[8px]">
          <div className="text-[12px] font-medium leading-[18px] text-[var(--color-text-1,#1d2129)]">
            绑定后输入验证码
          </div>
          <VerificationCode
            className="use-login-otp"
            length={6}
            value={code}
            status={status}
            disabled={loading}
            validate={({ inputValue }) => /^\d*$/.test(inputValue)}
            onChange={(next) => {
              setStatus(undefined);
              setCode(next);
            }}
            onFinish={submit}
          />
        </div>
      </div>

      <div className="box-border flex justify-end gap-[8px] px-[24px] pb-[24px] pt-[12px]">
        <Button className="min-w-[80px]" disabled={loading} onClick={onCancel}>
          {mandatory ? '退出登录' : '取消'}
        </Button>
        <Button
          className="min-w-[80px]"
          type="primary"
          loading={loading}
          onClick={() => submit(code)}
        >
          确定
        </Button>
      </div>
    </Modal>
  );
}

