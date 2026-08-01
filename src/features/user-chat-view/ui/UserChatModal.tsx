import React from 'react';
import { Modal } from '@arco-design/web-react';
import { ApiNotReady } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';

export type ChatModalScene = 'user' | 'group';

export type ChatModalTarget = {
  type: 'user' | 'group';
  id: string;
  name?: string;
  memberCount?: number;
  onlineCount?: number;
  online?: boolean;
};

export type UserChatModalProps = {
  visible: boolean;
  onClose: () => void;
  scene: ChatModalScene;
  userId: string | null;
  userNickname?: string;
  userAvatar?: string;
  target?: ChatModalTarget | null;
};

export default function UserChatModal({
  visible,
  onClose
}: UserChatModalProps) {
  const t = useLocale();

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      title={t['userChat.title']}
      style={{ width: 960 }}
    >
      <ApiNotReady className="min-h-[480px]" />
    </Modal>
  );
}
