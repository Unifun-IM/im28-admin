import React from 'react';
import { Modal } from '@arco-design/web-react';
import { ApiNotReady } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';

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
  const t = useLocale();

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null}
      title={t['resetGa.title']}
    >
      <ApiNotReady className="min-h-[200px]" />
    </Modal>
  );
}
