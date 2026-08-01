import React from 'react';
import { Modal } from '@arco-design/web-react';
import { ApiNotReady } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';

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
  const t = useLocale();
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null}
      title={t['menu.user.whitelist']}
      style={{ width: 520 }}
    >
      <ApiNotReady className="min-h-[200px]" />
    </Modal>
  );
}
