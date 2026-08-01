import React from 'react';
import { Drawer } from '@arco-design/web-react';
import { ApiNotReady } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';

export type GroupDetailDrawerProps = {
  visible: boolean;
  groupId?: string | null;
  defaultTab?: 'basic' | 'logs';
  onClose: () => void;
  onViewChat?: (payload: {
    groupId: string;
    groupName: string;
    memberCount?: number;
    ownerId?: string;
  }) => void;
};

export default function GroupDetailDrawer({
  visible,
  onClose
}: GroupDetailDrawerProps) {
  const t = useLocale();

  return (
    <Drawer
      visible={visible}
      onCancel={onClose}
      width={720}
      title={t['groupDetail.title']}
      footer={null}
    >
      <ApiNotReady className="min-h-[320px]" />
    </Drawer>
  );
}
