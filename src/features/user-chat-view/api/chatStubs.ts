/**
 * 查聊天 — 对接 Admin 会话查询 API
 * @see postV1AdminConversationsList / postV1AdminConversationMessagesList
 */
import {
  postV1AdminConversationMessagesList,
  postV1AdminConversationsList
} from '@shared/api/admin/adminhuihuachaxun';
import { formatDateTime } from '@shared/lib/formatTime';

export type ChatBookPeer = {
  id: string;
  /** 消息接口用的会话 ID */
  conversationId?: string;
  name: string;
  avatar?: string;
  sub?: string;
  lastMessage?: string;
  time?: string;
  online?: boolean;
  memberCount?: number;
  onlineCount?: number;
  kind: 'session' | 'group' | 'contact';
};

export type ChatBook = {
  sessions: ChatBookPeer[];
  groups: ChatBookPeer[];
  contacts: ChatBookPeer[];
  starred: ChatBookPeer[];
  contactSections: { letter: string; items: ChatBookPeer[] }[];
  groupCount: number;
  contactCount: number;
};

export type ChatMsg = {
  id: string;
  side: 'self' | 'peer';
  msgType: 'text' | 'voice' | 'file' | 'call' | 'date' | 'system' | 'image' | 'video';
  content?: string;
  senderName?: string;
  senderAvatar?: string;
  time?: string;
  duration?: string;
  fileName?: string;
  fileSize?: string;
};

const LIST_PAGE_SIZE = 100;
/** 防止异常 total 导致死循环 */
const LIST_PAGE_MAX = 20;

function lastMessagePreview(msg?: AdminAPI.AdminConversationMessage): string {
  if (!msg) return '';
  const body = msg.body || {};
  if (typeof body.text === 'string') return body.text;
  if (typeof body.content === 'string') return body.content;
  if (typeof body.file_name === 'string') return body.file_name;
  if (body.url || body.image_url) return '[图片]';
  return msg.type != null ? `[消息 ${msg.type}]` : '';
}

function mapConversation(
  c?: AdminAPI.AdminUserConversation
): ChatBookPeer | null {
  if (!c?.conversation_id) return null;
  const isGroup = c.type === 3;
  const peerId = isGroup ? c.group_id : c.peer_user_id;
  if (!peerId) return null;
  return {
    id: peerId,
    conversationId: c.conversation_id,
    name: c.title || peerId,
    avatar: c.avatar_url,
    lastMessage: lastMessagePreview(c.last_message),
    time: formatDateTime(c.last_active_at) || undefined,
    kind: isGroup ? 'group' : 'session'
  };
}

function mapMsgType(type?: number): ChatMsg['msgType'] {
  // OpenIM 常见：101 文本 / 102 图片 / 103 语音 / 104 视频 / 105 文件 …
  if (type === 102) return 'image';
  if (type === 103) return 'voice';
  if (type === 104) return 'video';
  if (type === 105) return 'file';
  return 'text';
}

function mapMessageContent(msg?: AdminAPI.AdminConversationMessage): {
  content?: string;
  fileName?: string;
  duration?: string;
} {
  const body = msg?.body || {};
  if (typeof body.text === 'string') return { content: body.text };
  if (typeof body.content === 'string') return { content: body.content };
  if (typeof body.file_name === 'string') {
    return {
      content: body.file_name,
      fileName: body.file_name,
      duration: body.duration != null ? String(body.duration) : undefined
    };
  }
  if (body.url || body.image_url) return { content: '' };
  return { content: msg?.type != null ? `[消息 ${msg.type}]` : '' };
}

async function listAllConversations(
  userId: string
): Promise<ChatBookPeer[]> {
  const peers: ChatBookPeer[] = [];
  let page = 1;
  let total = Infinity;
  while ((page - 1) * LIST_PAGE_SIZE < total && page <= LIST_PAGE_MAX) {
    const res = await postV1AdminConversationsList({
      user_id: userId,
      page,
      page_size: LIST_PAGE_SIZE
    });
    total = res.data?.total ?? 0;
    (res.data?.list || []).forEach((row) => {
      const peer = mapConversation(row.conversation);
      if (peer) peers.push(peer);
    });
    if (!(res.data?.list || []).length) break;
    page += 1;
  }
  return peers;
}

/** 拉取指定用户的会话列表，拆成单聊 / 群聊 */
export async function getUserChatBook(userId: string): Promise<ChatBook> {
  if (!userId) {
    return {
      sessions: [],
      groups: [],
      contacts: [],
      starred: [],
      contactSections: [],
      groupCount: 0,
      contactCount: 0
    };
  }
  const peers = await listAllConversations(userId);
  const sessions = peers.filter((p) => p.kind === 'session');
  const groups = peers.filter((p) => p.kind === 'group');
  return {
    sessions,
    groups,
    contacts: [],
    starred: [],
    contactSections: [],
    groupCount: groups.length,
    contactCount: 0
  };
}

/**
 * 在用户会话列表中按群 ID / 对端用户 ID 解析 conversation_id。
 * 消息接口必须使用 conversation_id，不能用 group_id / peer_user_id 代替。
 */
export async function findUserConversation(params: {
  userId: string;
  groupId?: string;
  peerUserId?: string;
}): Promise<ChatBookPeer | null> {
  const { userId, groupId, peerUserId } = params;
  if (!userId || (!groupId && !peerUserId)) return null;
  const peers = await listAllConversations(userId);
  if (groupId) {
    return peers.find((p) => p.kind === 'group' && p.id === groupId) || null;
  }
  return peers.find((p) => p.kind === 'session' && p.id === peerUserId) || null;
}

/**
 * 拉取会话消息。
 * - userId：被查看的 C 端用户（成员关系校验）
 * - conversationId：Admin 会话 ID（必填，不可用对端/群 ID 代替）
 */
export async function getChatMessages(params: {
  type: string;
  id: string;
  userId?: string;
  conversationId?: string;
  page?: number;
  pageSize?: number;
  beforeSeq?: string;
}): Promise<{
  list: ChatMsg[];
  total: number;
  nextSeq?: string;
  hasMore?: boolean;
}> {
  const userId = params.userId;
  const conversationId = params.conversationId;
  if (!userId || !conversationId) {
    return { list: [], total: 0 };
  }

  const res = await postV1AdminConversationMessagesList({
    user_id: userId,
    conversation_id: conversationId,
    before_seq: params.beforeSeq,
    limit: params.pageSize || 80
  });

  const users = new Map(
    (res.data?.users || []).map((u) => [u.user_id || '', u])
  );

  const list: ChatMsg[] = (res.data?.list || [])
    .map((row) => {
      const m = row.message;
      if (!m?.msg_id) return null;
      const sender = users.get(m.sender_id || '');
      const mapped = mapMessageContent(m);
      return {
        id: m.msg_id,
        side: m.sender_id === userId ? 'self' : 'peer',
        msgType: mapMsgType(m.type),
        content: mapped.content,
        fileName: mapped.fileName,
        duration: mapped.duration,
        senderName: sender?.nickname,
        senderAvatar: sender?.avatar_url,
        time: formatDateTime(m.sent_at) || undefined
      } satisfies ChatMsg;
    })
    .filter(Boolean) as ChatMsg[];

  // 接口按可见最新向前翻页；UI 列表通常从旧到新展示
  list.reverse();

  return {
    list,
    total: list.length,
    nextSeq: res.data?.next_seq,
    hasMore: res.data?.has_more
  };
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
  // 暂无独立搜索 Admin 契约，保持空壳
  return {
    list: [],
    mediaGroups: [],
    fileGroups: []
  };
}
