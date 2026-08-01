/**
 * 查聊天 / 聊天记录 — OpenAPI 尚未覆盖会话消息读写。
 * 保留 Figma 交互壳，返回空数据；待接口就绪后替换为真实请求。
 */

export type ChatBookPeer = {
  id: string;
  name: string;
  avatar?: string;
  sub?: string;
  lastMessage?: string;
  online?: boolean;
  memberCount?: number;
  onlineCount?: number;
  kind: 'session' | 'group' | 'contact';
};

export type ChatBook = {
  sessions: ChatBookPeer[];
  groups: ChatBookPeer[];
  contacts: ChatBookPeer[];
};

export type ChatMsg = Record<string, unknown> & {
  id?: string;
  content?: string;
  time?: string;
};

export async function getUserChatBook(_userId: string): Promise<ChatBook> {
  return { sessions: [], groups: [], contacts: [] };
}

export async function getChatMessages(_params: {
  type: string;
  id: string;
  page?: number;
  pageSize?: number;
}): Promise<{ list: ChatMsg[]; total: number }> {
  return { list: [], total: 0 };
}

export async function searchChatHistory(_params: {
  type: string;
  id: string;
  keyword?: string;
  tab?: string;
  date?: string;
  mediaFilter?: string;
}): Promise<{
  list: unknown[];
  mediaGroups: unknown[];
  fileGroups: unknown[];
}> {
  return {
    list: [],
    mediaGroups: [],
    fileGroups: []
  };
}
