import React, { useState } from 'react';
import { Button, Modal, VerificationCode } from '@arco-design/web-react';

export type GaVerifyModalProps = {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onOk: (code: string) => void;
};

/** GA 验证码弹窗 — Figma 602:35395 */
export default function GaVerifyModal({
  visible,
  loading,
  onCancel,
  onOk
}: GaVerifyModalProps) {
  const [code, setCode] = useState('');

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
      afterClose={() => setCode('')}
      style={{ width: 480 }}
    >
      <div className="box-border px-[24px] pb-[12px] pt-[24px]">
        <div className="text-[20px] font-medium leading-[28px] text-arco-text-1">
          GA验证码
        </div>
        <div className="text-[12px] leading-[20px] text-arco-text-3">
          请输入由您的身份验证器应用生成的6位验证码
        </div>
      </div>
      <div className="box-border px-[24px] py-[12px]">
        <VerificationCode
          className="use-login-otp"
          length={6}
          value={code}
          onChange={setCode}
        />
      </div>
      <div className="box-border flex justify-end gap-[8px] px-[24px] pb-[24px] pt-[12px]">
        <Button className="min-w-[80px]" onClick={onCancel}>
          取消
        </Button>
        <Button
          className="min-w-[80px]"
          type="primary"
          loading={loading}
          disabled={code.length < 6}
          onClick={() => onOk(code)}
        >
          确定
        </Button>
      </div>
    </Modal>
  );
}
