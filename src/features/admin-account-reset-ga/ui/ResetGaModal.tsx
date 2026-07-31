import React from 'react';
import { Modal } from '@arco-design/web-react';
import { ApiNotReady } from '@shared/ui';

export type ResetGaTarget = {
  id: string;
  account: string;
  name?: string;
};

export type ResetGaModalProps = {
  visible: boolean;
  target: ResetGaTarget | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

export default function ResetGaModal({
  visible,
  onCancel
}: ResetGaModalProps) {
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null}
      title="重置谷歌"
    >
      <ApiNotReady className="min-h-[200px]" />
    </Modal>
  );
}
