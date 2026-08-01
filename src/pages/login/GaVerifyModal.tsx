import React, { useEffect, useState } from 'react';
import { Button, Message, Modal, VerificationCode } from '@arco-design/web-react';

import useLocale from '@shared/lib/useLocale';


export type GaVerifyModalProps = {
  visible: boolean;
  loading?: boolean;
  /** 校验失败时递增，用于清空 OTP 并标红 */
  errorTick?: number;
  onCancel: () => void;
  onOk: (code: string) => void;
};

/**
 * GA 验证码弹窗 — 非首次登录（已绑定）
 * Figma 602:35395；Toast 文案 Figma 979:39539
 */
export default function GaVerifyModal({
  visible,
  loading,
  errorTick = 0,
  onCancel,
  onOk
}: GaVerifyModalProps) {
  const t = useLocale();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'error' | undefined>();

  useEffect(() => {
    if (visible) {
      setCode('');
      setStatus(undefined);
    }
  }, [visible]);

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
      Message.warning(t['login.msg.codeFormatShort']);
      return;
    }
    setStatus(undefined);
    onOk(value);
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
      unmountOnExit
      onCancel={onCancel}
      afterClose={() => {
        setCode('');
        setStatus(undefined);
      }}
      style={{ width: 480 }}
    >
      <div className="box-border px-[24px] pb-[12px] pt-[24px]">
        <div className="text-[20px] font-medium leading-[28px] text-[var(--color-text-1,#1d2129)]">
          {t['login.gaVerify.title']}
        </div>
        <div className="text-[12px] leading-[20px] text-[var(--color-text-3,#86909c)]">
          {t['login.gaVerify.desc']}
        </div>
      </div>
      <div className="box-border px-[24px] py-[12px]">
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
      <div className="box-border flex justify-end gap-[8px] px-[24px] pb-[24px] pt-[12px]">
        <Button className="min-w-[80px]" disabled={loading} onClick={onCancel}>
          {t['common.cancel']}
        </Button>
        <Button
          className="min-w-[80px]"
          type="primary"
          loading={loading}
          onClick={() => submit(code)}
        >
          {t['common.confirm']}
        </Button>
      </div>
    </Modal>
  );
}
