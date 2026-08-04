/**
 * 查聊天 — 对接 Admin 会话查询 API
 * @see postV1AdminConversationsList / postV1AdminConversationMessagesList
 * 通讯录 / 所属群：postV1AdminUsersContactsList / postV1AdminUsersGroupsList
 * 消息类型对齐 OpenIM MessageContentType
 * @see https://docs.openim.io/sdks/enum/messageContentType
 */
import {
  postV1AdminConversationMessagesList,
  postV1AdminConversationsList
} from '@shared/api/admin/adminhuihuachaxun';
import {
  postV1AdminUsersContactsList,
  postV1AdminUsersGroupsList
} from '@shared/api/admin/users';
import { formatDateTime } from '@shared/lib/formatTime';
import {
  isHiddenMessageContentType,
  mapMessageContentTypeToUi,
  parseOpenIMMessageBody
} from '@shared/lib/openimMessageContentType';
import { openimLabel } from '@shared/lib/openimLabels';
import openimLocale from '@shared/locale/openim';

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
  remark?: string;
  source?: string;
  addedAt?: string;
  starred?: boolean;
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
  msgType:
    | 'text'
    | 'voice'
    | 'file'
    | 'call'
    | 'date'
    | 'system'
    | 'image'
    | 'video'
    | 'card'
    | 'location'
    | 'quote'
    | 'merger';
  /** OpenIM / Admin MessageContentType 原始值 */
  contentType?: number;
  content?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  time?: string;
  duration?: string;
  fileName?: string;
  fileSize?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  callStatus?: string;
  callKind?: 'voice' | 'video';
  quoteSender?: string;
  quoteText?: string;
  cardKind?: 'user' | 'group';
  cardId?: string;
  cardName?: string;
  cardAvatar?: string;
  cardDesc?: string;
  cardMemberCount?: number;
  locationName?: string;
  locationAddress?: string;
  forwardFromName?: string;
  forwardFromAvatar?: string;
};

const LIST_PAGE_SIZE = 100;
/** 防止异常 total 导致死循环 */
const LIST_PAGE_MAX = 20;

/** 会话列表预览用中文 locale（列表层无 React hook） */
const zhOpenim = openimLocale['zh-CN'] as Record<string, string>;

function typeBracketLabel(type?: number): string {
  if (type == null) return '';
  const label = openimLabel(zhOpenim, 'messageType', type, '');
  return label ? `[${label}]` : `[消息 ${type}]`;
}

function lastMessagePreview(msg?: AdminAPI.AdminConversationMessage): string {
  if (!msg) return '';
  // 5=已删除；通常不会出现在列表中
  if (msg.status === 5) return '';
  if (isHiddenMessageContentType(msg.type)) return '';
  const body = msg.body || {};
  const parsed = parseOpenIMMessageBody(msg.type, body);
  const ui = mapMessageContentTypeToUi(msg.type, body);
  if (ui === 'text' || ui === 'system' || ui === 'quote') {
    return parsed.content?.trim() || typeBracketLabel(msg.type);
  }
  if (ui === 'call') {
    return parsed.content?.trim() || typeBracketLabel(msg.type) || '[通话]';
  }
  if (ui === 'file' && parsed.fileName) return parsed.fileName;
  if (ui === 'voice' && parsed.duration) {
    return `${typeBracketLabel(msg.type)} ${parsed.duration}`;
  }
  if (ui === 'card' && parsed.cardName) return parsed.cardName;
  if (ui === 'location' && parsed.locationName) return parsed.locationName;
  return typeBracketLabel(msg.type);
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
    sub: isGroup ? `ID：${peerId}` : undefined,
    lastMessage: lastMessagePreview(c.last_message),
    time: formatDateTime(c.last_active_at) || undefined,
    kind: isGroup ? 'group' : 'session'
  };
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

function mapContact(
  wrap: AdminAPI.AdminUserContactWrap
): ChatBookPeer | null {
  const user = wrap.user;
  const friend = wrap.friend;
  const id = user?.user_id || friend?.friend_user_id;
  if (!id) return null;
  const alias = friend?.alias?.trim();
  const nickname = user?.nickname?.trim();
  return {
    id,
    name: alias || nickname || id,
    avatar: user?.avatar_url,
    remark: friend?.remark?.trim() || alias || undefined,
    source: friend?.source_type || undefined,
    addedAt: formatDateTime(friend?.created_at) || undefined,
    starred: !!friend?.is_starred,
    kind: 'contact'
  };
}

function mapUserGroup(
  wrap: AdminAPI.AdminUserGroupWrap
): ChatBookPeer | null {
  const group = wrap.group;
  const member = wrap.member;
  const id = group?.group_id;
  if (!id) return null;
  const nick = member?.nickname?.trim();
  return {
    id,
    name: group?.title || id,
    avatar: group?.avatar_url,
    sub: nick ? `群昵称：${nick}` : `ID：${id}`,
    memberCount: group?.member_count,
    kind: 'group'
  };
}

function buildContactSections(contacts: ChatBookPeer[]) {
  const map = new Map<string, ChatBookPeer[]>();
  const sorted = [...contacts].sort((a, b) =>
    a.name.localeCompare(b.name, 'zh')
  );
  for (const c of sorted) {
    const ch = (c.name || '').trim().charAt(0).toUpperCase();
    const letter = /^[A-Z]$/.test(ch) ? ch : '#';
    const list = map.get(letter) || [];
    list.push(c);
    map.set(letter, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    })
    .map(([letter, items]) => ({ letter, items }));
}

async function listAllContacts(userId: string): Promise<ChatBookPeer[]> {
  const peers: ChatBookPeer[] = [];
  let page = 1;
  let total = Infinity;
  while ((page - 1) * LIST_PAGE_SIZE < total && page <= LIST_PAGE_MAX) {
    const res = await postV1AdminUsersContactsList({
      user_id: userId,
      page,
      page_size: LIST_PAGE_SIZE
    });
    total = res.data?.total ?? 0;
    (res.data?.list || []).forEach((row) => {
      const peer = mapContact(row);
      if (peer) peers.push(peer);
    });
    if (!(res.data?.list || []).length) break;
    page += 1;
  }
  return peers;
}

async function listAllUserGroups(userId: string): Promise<ChatBookPeer[]> {
  const peers: ChatBookPeer[] = [];
  let page = 1;
  let total = Infinity;
  while ((page - 1) * LIST_PAGE_SIZE < total && page <= LIST_PAGE_MAX) {
    const res = await postV1AdminUsersGroupsList({
      user_id: userId,
      page,
      page_size: LIST_PAGE_SIZE
    });
    total = res.data?.total ?? 0;
    (res.data?.list || []).forEach((row) => {
      const peer = mapUserGroup(row);
      if (peer) peers.push(peer);
    });
    if (!(res.data?.list || []).length) break;
    page += 1;
  }
  return peers;
}

/** 拉取指定用户的会话列表，拆成单聊 / 群聊；通讯录接 contacts/groups 接口 */
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
  const [peers, contacts, memberGroups] = await Promise.all([
    listAllConversations(userId),
    listAllContacts(userId),
    listAllUserGroups(userId)
  ]);
  const sessions = peers.filter((p) => p.kind === 'session');
  const conversationGroups = peers.filter((p) => p.kind === 'group');
  const convById = new Map(conversationGroups.map((g) => [g.id, g]));
  const groups = memberGroups.map((g) => {
    const hit = convById.get(g.id);
    return hit
      ? {
          ...g,
          conversationId: hit.conversationId,
          lastMessage: hit.lastMessage,
          time: hit.time
        }
      : g;
  });
  // 会话里有、所属群接口未返回的群仍保留
  const known = new Set(groups.map((g) => g.id));
  conversationGroups.forEach((g) => {
    if (!known.has(g.id)) groups.push(g);
  });
  const starred = contacts.filter((c) => c.starred);
  return {
    sessions,
    groups,
    contacts,
    starred,
    contactSections: buildContactSections(contacts),
    groupCount: groups.length,
    contactCount: contacts.length
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
      if (m.status === 5) return null;
      if (isHiddenMessageContentType(m.type)) return null;

      const sender = users.get(m.sender_id || '');
      const body = (m.body || {}) as Record<string, any>;
      const parsed = parseOpenIMMessageBody(m.type, body, {
        viewerUserId: userId,
        // 只回传 nickname；无昵称时由解析层从 application_msg 兜底
        resolveUserName: (id) => {
          const nick = users.get(id)?.nickname?.trim();
          return nick || undefined;
        }
      });
      const uiType = mapMessageContentTypeToUi(m.type, body);
      const fallback = typeBracketLabel(m.type);
      // 气泡内展示短时间；完整时间在 formatDateTime 里
      const fullTime = formatDateTime(m.sent_at) || undefined;
      const shortTime = fullTime
        ? fullTime.replace(/^\d{4}-\d{2}-\d{2}\s*/, '').slice(0, 5) || fullTime
        : undefined;

      return {
        id: m.msg_id,
        side: m.sender_id === userId ? 'self' : 'peer',
        msgType: uiType,
        contentType: m.type,
        content:
          parsed.content?.trim() ||
          (uiType === 'text' || uiType === 'system' || uiType === 'quote'
            ? fallback
            : ''),
        fileName: parsed.fileName,
        fileSize: parsed.fileSize,
        duration: parsed.duration,
        mediaUrl: parsed.mediaUrl,
        thumbnailUrl: parsed.thumbnailUrl,
        callStatus: parsed.callStatus,
        callKind: parsed.callKind,
        quoteSender: parsed.quoteSender,
        quoteText: parsed.quoteText,
        cardKind: parsed.cardKind,
        cardId: parsed.cardId,
        cardName: parsed.cardName,
        cardAvatar: parsed.cardAvatar,
        cardDesc: parsed.cardDesc,
        cardMemberCount: parsed.cardMemberCount,
        locationName: parsed.locationName,
        locationAddress: parsed.locationAddress,
        forwardFromName: parsed.forwardFromName,
        forwardFromAvatar: parsed.forwardFromAvatar,
        senderId: m.sender_id,
        senderName: sender?.nickname,
        senderAvatar: sender?.avatar_url,
        time: shortTime
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
