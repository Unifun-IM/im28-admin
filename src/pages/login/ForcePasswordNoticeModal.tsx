import React from 'react';
import { Button, Modal } from '@arco-design/web-react';

export type ForcePasswordNoticeModalProps = {
  visible: boolean;
  onContinue: () => void;
};

/**
 * 首次登录改密提示 — Figma 921:44793
 * 不可关闭 / 跳过，仅「立即修改」
 */
export default function ForcePasswordNoticeModal({
  visible,
  onContinue
}: ForcePasswordNoticeModalProps) {
  return (
    <Modal
      className="use-login-force-modal"
      wrapClassName="use-login-ga-modal-wrap"
      visible={visible}
      title={null}
      footer={null}
      closable={false}
      maskClosable={false}
      escToExit={false}
      unmountOnExit
      style={{ width: 480 }}
    >
      <div className="box-border flex h-[48px] items-center border-0 border-b border-solid border-[rgba(0,0,0,0.08)] px-[24px]">
        <span className="text-[16px] font-medium leading-6 text-[var(--color-text-1,#1d2129)]">
          新建账号
        </span>
      </div>
      <div className="box-border p-[24px] text-[14px] leading-[21px] text-black">
        <p className="m-0">首次登录，请修改密码</p>
        <p className="m-0">
          为了保障账号安全，首次登录必须修改默认密码。完成修改后才能进入后台。
        </p>
      </div>
      <div className="box-border flex h-[48px] items-center justify-end border-0 border-t border-solid border-[var(--color-border-1,#f2f3f5)] px-[24px]">
        <Button type="primary" className="min-w-[80px]" onClick={onContinue}>
          立即修改
        </Button>
      </div>
    </Modal>
  );
}
