import React from 'react';
import { Modal } from '@arco-design/web-react';
import { ApiNotReady } from '@shared/ui';

export type WhitelistActionModalProps = {
  visible: boolean;
  /** add = 添加白名单；remove = 移除白名单 */
  mode: 'add' | 'remove';
  variant?: 'single' | 'batch';
  userIds?: string[];
  onCancel: () => void;
  onSuccess?: () => void;
};

/** 白名单操作 — OpenAPI 未覆盖，空态 */
export default function WhitelistActionModal({
  visible,
  onCancel
}: WhitelistActionModalProps) {
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null}
      title="白名单"
      style={{ width: 520 }}
    >
      <ApiNotReady className="min-h-[200px]" />
    </Modal>
  );
}
