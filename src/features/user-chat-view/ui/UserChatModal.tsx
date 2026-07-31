import React from 'react';
import { Modal } from '@arco-design/web-react';
import { ApiNotReady } from '@shared/ui';

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
  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      title="查聊天"
      style={{ width: 960 }}
    >
      <ApiNotReady className="min-h-[480px]" />
    </Modal>
  );
}
