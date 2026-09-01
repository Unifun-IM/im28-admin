import React from 'react';
import { Button, Modal } from '@arco-design/web-react';
import { IconExclamationCircleFill } from '@arco-design/web-react/icon';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';

export type UnsavedChangesModalProps = {
  visible: boolean;
  onStay: () => void;
  onLeave: () => void;
};

/**
 * 未保存修改提示 — Figma 979:44325（标题：警告图标 +「未保存的修改」）
 */
export default function UnsavedChangesModal({
  visible,
  onStay,
  onLeave
}: UnsavedChangesModalProps) {
  const t = useLocale();

  return (
    <Modal
      className="use-biz-form-modal"
      visible={visible}
      onCancel={onStay}
      closable={false}
      maskClosable={false}
      escToExit={false}
      unmountOnExit
      style={{ width: 480 }}
      title={
        <span className="inline-flex items-center gap-2">
          <IconExclamationCircleFill className="text-[20px] text-[rgb(var(--warning-6))]" />
          <span className="text-[16px] font-medium leading-6 text-arco-text-1">
            {t['unsaved.title']}
          </span>
        </span>
      }
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <Button className="min-w-[80px]" onClick={onStay}>
            {t['unsaved.stay']}
          </Button>
          <Button
            type="primary"
            status="warning"
            className="min-w-[80px]"
            onClick={onLeave}
          >
            {t['unsaved.leave']}
          </Button>
        </div>
      }
    >
      <p className="m-0 text-[14px] leading-[22px] text-arco-text-2">
        {t['unsaved.content']}
      </p>
    </Modal>
  );
}
