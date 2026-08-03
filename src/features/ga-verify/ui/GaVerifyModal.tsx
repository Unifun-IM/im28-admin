import React, { useEffect, useState } from 'react';
import { Button, Message, Modal, VerificationCode } from '@arco-design/web-react';
import useLocale from '@shared/lib/useLocale';
import './ga-verify-modal.less';

export type GaVerifyModalProps = {
  visible: boolean;
  loading?: boolean;
  /** 校验失败时递增，用于清空 OTP 并标红 */
  errorTick?: number;
  onCancel: () => void;
  onOk: (code: string) => void;
};

/**
 * 通用 GA 验证码弹窗 — Figma 602:35395 / 921:44417
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
      className="use-ga-verify-modal"
      wrapClassName="use-ga-verify-modal-wrap"
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
      <div className="use-ga-header">
        <div className="use-ga-title">{t['gaVerify.title']}</div>
        <div className="use-ga-desc">{t['gaVerify.desc']}</div>
      </div>
      <div className="use-ga-body">
        <VerificationCode
          className="use-ga-otp"
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
      <div className="use-ga-footer">
        <Button type="secondary" disabled={loading} onClick={onCancel}>
          {t['common.cancel']}
        </Button>
        <Button type="primary" loading={loading} onClick={() => submit(code)}>
          {t['common.confirm']}
        </Button>
      </div>
    </Modal>
  );
}
