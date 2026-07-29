import React, { useState } from 'react';
import { Button, Input, Message, Modal, VerificationCode } from '@arco-design/web-react';
import copyIcon from './assets/icon-copy.svg';

export type GaBindModalProps = {
  visible: boolean;
  loading?: boolean;
  /** 手动绑定密钥 */
  secret?: string;
  /** 二维码图片 URL；缺省显示 Mock 占位 */
  qrUrl?: string;
  onCancel: () => void;
  onOk: (code: string) => void;
};

/** 绑定 GA 验证码弹窗 — Figma 602:35484 */
export default function GaBindModal({
  visible,
  loading,
  secret = 'JBSWY3DP EHPK3PXP',
  qrUrl,
  onCancel,
  onOk
}: GaBindModalProps) {
  const [code, setCode] = useState('');

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret.replace(/\s/g, ''));
      Message.success('已复制密钥');
    } catch {
      Message.error('复制失败');
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
      unmountOnExit
      onCancel={onCancel}
      afterClose={() => setCode('')}
      style={{ width: 480 }}
    >
      <div className="box-border px-[24px] pb-[12px] pt-[24px]">
        <div className="text-[20px] font-medium leading-[28px] text-arco-text-1">
          绑定GA验证码
        </div>
        <div className="text-[12px] leading-[20px] text-arco-text-3">
          使用 Google Authenticator 或 Authy 扫描下面的二维码。
        </div>
      </div>

      <div className="box-border flex flex-col gap-[24px] px-[24px] py-[12px]">
        <div className="flex justify-center">
          <div className="box-border size-[142px] rounded-[11px] border border-solid border-[#e5e7eb] bg-[#f7f8fa] p-[15px]">
            {qrUrl ? (
              <img src={qrUrl} alt="GA QR" className="size-full object-contain" />
            ) : (
              <div className="flex h-[112px] w-full items-center justify-center border border-dashed border-[#99a1af] bg-[#e5e7eb] text-[10.5px] leading-[14px] text-[#6b7280]">
                QR Code Mock
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <div className="text-[12px] font-medium leading-[18px] text-arco-text-1">
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
          <div className="text-[12px] font-medium leading-[18px] text-arco-text-1">
            绑定后输入验证码
          </div>
          <VerificationCode
            className="use-login-otp"
            length={6}
            value={code}
            onChange={setCode}
          />
        </div>
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
