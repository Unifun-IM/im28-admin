import React, { useEffect, useState } from 'react';
import { Button, Input, Message, Modal, VerificationCode } from '@arco-design/web-react';

import useLocale from '@shared/lib/useLocale';
import '@features/ga-verify/ui/ga-verify-modal.less';

import copyIcon from '@app/assets/icon-copy.svg';

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
  const t = useLocale();
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
      <div className="use-ga-header">
        <div className="use-ga-title">{t['login.gaBind.title']}</div>
        <div className="use-ga-desc">{t['login.gaBind.desc']}</div>
      </div>

      <div className="use-ga-body use-ga-body-bind">
        <div className="use-ga-qr-wrap">
          <div className="use-ga-qr">
            {qrUrl && !qrFailed ? (
              <img
                src={qrUrl}
                alt="GA QR"
                onError={() => {
                  setQrFailed(true);
                  Message.error(t['login.msg.qrLoadFail']);
                }}
              />
            ) : (
              <div className="use-ga-qr-fallback">
                {qrFailed
                  ? t['login.gaBind.qrFail']
                  : t['login.gaBind.qrLoading']}
              </div>
            )}
          </div>
        </div>

        <div className="use-ga-section">
          <div className="use-ga-label">{t['login.gaBind.manual']}</div>
          <Input
            className="use-login-secret"
            readOnly
            value={secret}
            suffix={
              <button
                type="button"
                className="use-ga-secret-copy"
                onClick={copySecret}
                aria-label={t['login.gaBind.copySecret']}
              >
                <img src={copyIcon} alt="" />
              </button>
            }
          />
        </div>

        <div className="use-ga-section">
          <div className="use-ga-label">{t['login.gaBind.codeAfter']}</div>
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
      </div>

      <div className="use-ga-footer">
        <Button type="secondary" disabled={loading} onClick={onCancel}>
          {mandatory ? t['navbar.logout'] : t['common.cancel']}
        </Button>
        <Button type="primary" loading={loading} onClick={() => submit(code)}>
          {t['common.confirm']}
        </Button>
      </div>
    </Modal>
  );
}
