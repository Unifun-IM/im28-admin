import React from 'react';
import { ApiNotReady } from '@shared/ui';

export type ChatHistoryPanelProps = {
  userId: string;
  peerId?: string | null;
  className?: string;
};

/** 聊天记录 — OpenAPI 未覆盖，空态 */
export default function ChatHistoryPanel(_props: ChatHistoryPanelProps) {
  return <ApiNotReady className="min-h-[320px]" />;
}
