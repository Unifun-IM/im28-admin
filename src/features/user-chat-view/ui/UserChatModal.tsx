import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Image,
  Input,
  Message,
  Modal,
  Spin,
  Typography
} from '@arco-design/web-react';
import { UserAvatar } from '@shared/ui';
import {
  IconCopy,
  IconDown,
  IconMute,
  IconPlus,
  IconRight,
  IconSearch
} from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import {
  getChatMessages,
  getUserChatBook
} from '../api/chatStubs';
import emptyLogo from '../assets/chat-empty-logo.svg';
import iconChatBubbleTailPeer from '../assets/icon-chat-bubble-tail-peer.svg';
import iconChatBubbleTailSelf from '../assets/icon-chat-bubble-tail-self.svg';
import iconChatPhoneDisabledPeer from '../assets/icon-chat-phone-disabled-peer.svg';
import iconChatPhoneDisabledSelf from '../assets/icon-chat-phone-disabled-self.svg';
import iconChatPhonePeer from '../assets/icon-chat-phone-peer.svg';
import iconChatPhoneSelf from '../assets/icon-chat-phone-self.svg';
import iconChatPlay from '../assets/icon-chat-play.svg';
import iconChatRead from '../assets/icon-chat-read.svg';
import iconChatVideoOffPeer from '../assets/icon-chat-video-off-peer.svg';
import iconChatVideoOffSelf from '../assets/icon-chat-video-off-self.svg';
import iconChatVideoPeer from '../assets/icon-chat-video-peer.svg';
import iconChatVideoSelf from '../assets/icon-chat-video-self.svg';
import iconClose from '../assets/icon-close.svg';
import iconContacts from '../assets/icon-contacts.svg';
import iconContactsActive from '../assets/icon-contacts-active.svg';
import iconPhone from '../assets/icon-phone.svg';
import iconPhoneActive from '../assets/icon-phone-active.svg';
import iconSession from '../assets/icon-session.svg';
import iconSessionActive from '../assets/icon-session-active.svg';
import iconStar from '../assets/icon-star.svg';
import ChatHistoryPanel from './ChatHistoryPanel';
import './user-chat-modal.less';

const { Text } = Typography;

/** 气泡内时间 + 已读（Figma 977:24119 / 977:24120） */
function BubbleMeta({ time, isSelf }: { time?: string; isSelf: boolean }) {
  if (!time) return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 text-[10px] leading-[1.3] ${
        isSelf ? 'text-white/40' : 'text-[rgba(0,0,0,0.4)]'
      }`}
    >
      {time}
      {isSelf ? (
        <span className="relative inline-flex size-3 shrink-0 items-center justify-center overflow-hidden">
          <img
            src={iconChatRead}
            alt=""
            className="h-[6px] w-[11px] max-w-none"
          />
        </span>
      ) : null}
    </span>
  );
}

/**
 * 气泡外壳（Figma 977:24124 / 977:24119 / 977:24120）
 * 四角统一 12px；尾巴叠在圆角外侧，勿裁掉尾巴侧圆角（否则会出现尖刺断层）。
 */
function bubbleShell(isSelf: boolean, withSenderName = false) {
  const base = isSelf
    ? 'relative max-w-full rounded-xl bg-[#7b61ff] px-2 py-1.5 text-[14px] leading-[1.3] text-white'
    : 'relative max-w-full rounded-xl border border-solid border-[rgba(120,120,128,0.12)] bg-white px-2 py-1.5 text-[14px] leading-[1.3] text-black';
  if (withSenderName) {
    return `${base} inline-flex flex-col items-start gap-1`;
  }
  return `${base} inline-flex items-end gap-2`;
}

/**
 * 气泡尾巴（Figma 977:24124 对方 / 977:24120 自己）
 * 对方：bottom-[-1px] left-[-7px]；稿面为 -scale-y-100+rotate-180，这里用等效的 -scale-x-100
 * 自己：bottom-0 right-[-6px]；尖角埋进圆角，弯角外露
 */
function BubbleTail({ isSelf }: { isSelf: boolean }) {
  if (isSelf) {
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-[-6px] block h-[15px] w-3 overflow-visible"
      >
        <span className="absolute inset-[10.78%_8.83%_0_-8.09%]">
          <img
            src={iconChatBubbleTailSelf}
            alt=""
            className="block size-full max-w-none"
          />
        </span>
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-[-1px] left-[-7px] flex h-[15px] w-3 items-center justify-center overflow-visible"
    >
      <span className="-scale-x-100 flex-none">
        <span className="relative block h-[15px] w-3">
          <span className="absolute inset-[0_0_0_-18.33%]">
            <img
              src={iconChatBubbleTailPeer}
              alt=""
              className="block size-full max-w-none"
            />
          </span>
        </span>
      </span>
    </span>
  );
}

type NavTab = 'sessions' | 'contacts' | 'calls';

/** 入口场景：用户会话查询 / 群组会话查询 */
export type ChatModalScene = 'user' | 'group';

/** 预打开的会话目标（单聊用户或群） */
export type ChatModalTarget = {
  type: 'user' | 'group';
  id: string;
  name?: string;
  memberCount?: number;
  onlineCount?: number;
  online?: boolean;
  /** 群入口时用于会话/消息接口的 C 端用户（通常为群主） */
  viewerUserId?: string;
};

type ChatPeer = {
  id: string;
  /** Admin 会话 ID；拉消息必填 */
  conversationId?: string;
  name: string;
  avatar?: string;
  avatars?: string[];
  sub?: string;
  lastMessage?: string;
  time?: string;
  online?: boolean;
  starred?: boolean;
  muted?: boolean;
  unread?: number;
  memberCount?: number;
  onlineCount?: number;
  remark?: string;
  source?: string;
  addedAt?: string;
  kind: 'user' | 'group' | 'session';
};

export type UserChatModalProps = {
  visible: boolean;
  onClose: () => void;
  /**
   * 入口场景（参数区分单聊 / 群聊）
   * - user：用户会话查询进入，默认会话列表
   * - group：群组会话查询进入，默认通讯录群资料（进入群聊后再开消息）
   */
  scene: ChatModalScene;
  /** 被查看用户 ID（用户会话必填；群入口可用群主 ID 作通讯录上下文） */
  userId: string | null;
  userNickname?: string;
  userAvatar?: string;
  /** 预打开聊天目标；scene=group 时通常传 type:'group' */
  target?: ChatModalTarget | null;
};

type ContactSection = {
  letter: string;
  items: ChatPeer[];
};

type ChatBook = {
  sessions: ChatPeer[];
  groups: ChatPeer[];
  starred: ChatPeer[];
  contactSections: ContactSection[];
  groupCount: number;
  contactCount: number;
};

type ChatMsg = {
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
  /** OpenIM / Admin MessageContentType */
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
  dateLabel?: string;
};

/**
 * 查聊天 Modal（单聊 / 群聊共用）
 * 用 scene + target 区分入口：
 * - scene=user：791:30435 / 791:36214 / 791:32208
 * - scene=group：977:23441（群资料）→ 977:23565（进入群聊）
 */
export default function UserChatModal({
  visible,
  scene,
  userId,
  userNickname,
  userAvatar,
  target = null,
  onClose
}: UserChatModalProps) {
  const isGroupScene = scene === 'group';
  const [nav, setNav] = useState<NavTab>(
    isGroupScene ? 'contacts' : target ? 'sessions' : 'contacts'
  );
  const [keyword, setKeyword] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [book, setBook] = useState<ChatBook | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(isGroupScene);
  const [contactsOpen, setContactsOpen] = useState(!isGroupScene);
  /** 通讯录选中的好友/群（右侧资料卡） */
  const [profile, setProfile] = useState<ChatPeer | null>(null);
  /** 会话/发消息/进入群聊打开的聊天 */
  const [chat, setChat] = useState<ChatPeer | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const targetToPeer = (t: ChatModalTarget): ChatPeer => ({
    id: t.id,
    name: t.name || t.id,
    sub: t.type === 'group' ? `ID：${t.id}` : undefined,
    memberCount: t.memberCount,
    onlineCount: t.onlineCount,
    online: t.online,
    kind: t.type === 'group' ? 'group' : 'session'
  });

  const viewerUserId = target?.viewerUserId || userId;

  useEffect(() => {
    if (!visible) return;
    // 群组会话入口：通讯录 + 群资料卡（977:23441），不直接进聊天
    const startNav: NavTab = isGroupScene
      ? 'contacts'
      : target
        ? 'sessions'
        : 'contacts';
    setNav(startNav);
    setKeyword('');
    setGroupsOpen(isGroupScene);
    setContactsOpen(!isGroupScene);
    setProfile(null);
    setChat(null);
    setMessages([]);

    // 无查看用户时仍可展示目标群资料（消息需 conversationId + userId）
    if (!viewerUserId) {
      if (isGroupScene && target?.type === 'group') {
        const peer = targetToPeer(target);
        setBook({
          sessions: [],
          groups: [peer],
          starred: [],
          contactSections: [],
          groupCount: 1,
          contactCount: 0
        });
        setProfile(peer);
      } else {
        setBook(null);
      }
      setBookLoading(false);
      return;
    }

    setBookLoading(true);
    getUserChatBook(viewerUserId)
      .then((res) => {
        let data = res as unknown as ChatBook;
        if (target?.type === 'group') {
          const hit = data.groups.find((x) => x.id === target.id);
          const peer: ChatPeer = hit
            ? {
                ...hit,
                name: target.name || hit.name,
                memberCount: target.memberCount ?? hit.memberCount,
                onlineCount: target.onlineCount ?? hit.onlineCount,
                sub: hit.sub || `ID：${hit.id}`
              }
            : targetToPeer(target);
          // 目标群不在群主会话列表时仍展示在左侧，便于对照稿面交互
          if (!hit) {
            data = {
              ...data,
              groups: [peer, ...data.groups],
              groupCount: data.groupCount + 1
            };
          } else {
            data = {
              ...data,
              groups: data.groups.map((g) => (g.id === peer.id ? peer : g))
            };
          }
          setBook(data);
          setProfile(peer);
          setChat(null);
          return;
        }
        setBook(data);
        if (target?.type === 'user') {
          const s = data.sessions.find((x) => x.id === target.id);
          setChat(s?.conversationId ? s : targetToPeer(target));
          return;
        }
        // 用户入口：默认打开会话列表第一项，避免右侧空白
        if (scene === 'user' && data.sessions?.length) {
          setNav('sessions');
          setChat(data.sessions[0]);
        }
      })
      .finally(() => setBookLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, viewerUserId, scene, target?.id, target?.type]);

  useEffect(() => {
    if (!visible || !chat?.conversationId || !viewerUserId) {
      setMessages([]);
      return;
    }
    setMsgLoading(true);
    getChatMessages({
      type: chat.kind === 'group' ? 'group' : 'user',
      id: chat.id,
      userId: viewerUserId,
      conversationId: chat.conversationId,
      page: 1,
      pageSize: 80
    })
      .then((res) => setMessages((res.list || []) as unknown as ChatMsg[]))
      .finally(() => setMsgLoading(false));
  }, [visible, chat, viewerUserId]);

  const matchKw = (name: string, sub?: string) => {
    const q = keyword.trim().toLowerCase();
    if (!q) return true;
    return (
      name.toLowerCase().includes(q) ||
      String(sub || '')
        .toLowerCase()
        .includes(q)
    );
  };

  const filteredSessions = useMemo(
    () => (book?.sessions || []).filter((s) => matchKw(s.name, s.lastMessage)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [book, keyword]
  );

  const filteredGroups = useMemo(
    () => (book?.groups || []).filter((g) => matchKw(g.name, g.sub)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [book, keyword]
  );

  const filteredStarred = useMemo(
    () => (book?.starred || []).filter((c) => matchKw(c.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [book, keyword]
  );

  const filteredSections = useMemo(() => {
    return (book?.contactSections || [])
      .map((sec) => ({
        ...sec,
        items: sec.items.filter((c) => matchKw(c.name))
      }))
      .filter((sec) => sec.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, keyword]);

  const switchNav = (next: NavTab) => {
    setNav(next);
    setKeyword('');
    setProfile(null);
    setChat(null);
  };

  /** 通讯录点好友/群 → 右侧资料卡（不直接进聊天） */
  const onSelectContact = (peer: ChatPeer) => {
    setChat(null);
    setProfile(peer);
  };

  /** 会话列表点项 → 打开聊天 */
  const onSelectSession = (peer: ChatPeer) => {
    setProfile(null);
    setChat(peer);
  };

  const upsertSession = (sessionPeer: ChatPeer) => {
    setBook((prev) => {
      if (!prev) return prev;
      const exists = prev.sessions.some((s) => s.id === sessionPeer.id);
      if (exists) {
        return {
          ...prev,
          sessions: prev.sessions.map((s) =>
            s.id === sessionPeer.id ? { ...s, ...sessionPeer } : s
          )
        };
      }
      return { ...prev, sessions: [sessionPeer, ...prev.sessions] };
    });
  };

  /** 好友详情「发消息」→ 切到会话 Tab 并打开该单聊 */
  const sendMessage = (peer: ChatPeer) => {
    const sessionPeer: ChatPeer = {
      ...peer,
      kind: 'session',
      lastMessage: peer.lastMessage || '开始聊天',
      time: peer.time || '刚刚'
    };
    setProfile(null);
    setNav('sessions');
    setKeyword('');
    setChat(sessionPeer);
    upsertSession(sessionPeer);
  };

  /** 群详情「进入群聊」 */
  const enterGroupChat = (peer: ChatPeer) => {
    const sessionPeer: ChatPeer = {
      ...peer,
      kind: 'group',
      lastMessage: peer.lastMessage || '进入群聊',
      time: peer.time || '刚刚',
      unread: 0
    };
    // 群组会话入口：留在通讯录群列表（977:23565），返回资料卡
    if (isGroupScene) {
      setProfile(peer);
      setChat(sessionPeer);
      return;
    }
    // 用户会话入口：切到会话 Tab
    setProfile(null);
    setNav('sessions');
    setKeyword('');
    setChat(sessionPeer);
    upsertSession(sessionPeer);
  };

  const leaveChat = () => {
    // 群入口返回资料卡；用户入口清空聊天区
    if (isGroupScene && chat) {
      setProfile((prev) => prev || chat);
    }
    setChat(null);
  };

  /** Figma：群入口固定「搜索群」；通讯录「搜索好友」；会话/通话「搜索」 */
  const searchPlaceholder = isGroupScene
    ? '搜索群'
    : nav === 'contacts'
      ? groupsOpen && !contactsOpen
        ? '搜索群'
        : '搜索好友'
      : '搜索';

  const listActiveId = chat?.id || profile?.id;

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      unmountOnExit
      maskClosable
      alignCenter
      className="use-user-chat-modal"
      wrapClassName="use-user-chat-modal-wrap"
      style={{
        width: 'min(1024px, 90vw)',
        height: 'min(768px, calc(100vh - 80px))',
        maxHeight: 'calc(100vh - 80px)'
      }}
    >
      <div className="use-user-chat-shell flex h-full min-h-0 w-full overflow-hidden rounded-[24px] bg-[#f3f3f3]">
        <aside className="flex h-full min-h-0 w-[64px] shrink-0 flex-col items-center border-r border-solid border-[rgba(120,120,128,0.12)] bg-[#f3f3f3] py-3">
          <div className="flex w-full flex-col items-center gap-8">
            <button
              type="button"
              aria-label="关闭"
              className="inline-flex h-[40px] w-[40px] min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-[8px] border-0 bg-[#e5e6eb] p-0"
              onClick={onClose}
            >
              <img src={iconClose} alt="" className="h-[20px] w-[20px]" />
            </button>
            <div className="flex flex-col items-center gap-4">
              <UserAvatar
                size={40}
                className="shrink-0"
                userId={userId}
                name={userNickname}
                src={userAvatar}
              />
              {/* 群组会话入口仅关闭+头像（977:23441）；用户入口保留会话/通讯录/通话 */}
              {!isGroupScene ? (
                <>
                  <NavIcon
                    active={nav === 'sessions'}
                    src={iconSession}
                    activeSrc={iconSessionActive}
                    label="会话"
                    onClick={() => switchNav('sessions')}
                  />
                  <NavIcon
                    active={nav === 'contacts'}
                    src={iconContacts}
                    activeSrc={iconContactsActive}
                    label="通讯录"
                    onClick={() => switchNav('contacts')}
                  />
                  <NavIcon
                    active={nav === 'calls'}
                    src={iconPhone}
                    activeSrc={iconPhoneActive}
                    label="通话"
                    onClick={() => switchNav('calls')}
                  />
                </>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="use-user-chat-side flex h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden border-r border-solid border-[rgba(120,120,128,0.12)] bg-[#fafafa]">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-solid border-[rgba(120,120,128,0.12)] px-4 py-2">
            <Input
              allowClear
              value={keyword}
              onChange={setKeyword}
              placeholder={searchPlaceholder}
              prefix={<IconSearch className="text-arco-text-3" />}
              className="use-user-chat-search min-w-0 flex-1"
            />
            {nav === 'contacts' && !isGroupScene ? (
              <button
                type="button"
                aria-label="添加"
                className="inline-flex size-8 shrink-0 cursor-default items-center justify-center rounded-md border-0 bg-[#f0f0f0] p-0 text-arco-text-2"
              >
                <IconPlus className="text-[16px]" />
              </button>
            ) : null}
          </div>
          {/* absolute 铺满，保证会话/好友列表可滚 */}
          <div className="use-user-chat-side-scroll">
            {bookLoading ? (
              <div className="flex h-full min-h-40 items-center justify-center">
                <Spin />
              </div>
            ) : nav === 'sessions' ? (
              <SessionList
                items={filteredSessions}
                activeId={listActiveId}
                onSelect={onSelectSession}
              />
            ) : nav === 'calls' ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-[14px] text-arco-text-3">
                暂无通话记录
              </div>
            ) : (
              <ContactsPanel
                groupsOnly={isGroupScene}
                groupsOpen={groupsOpen}
                contactsOpen={contactsOpen}
                groupCount={book?.groupCount ?? filteredGroups.length}
                contactCount={book?.contactCount ?? 0}
                groups={filteredGroups}
                starred={filteredStarred}
                sections={filteredSections}
                activeId={listActiveId}
                onToggleGroups={() => setGroupsOpen((v) => !v)}
                onToggleContacts={() => setContactsOpen((v) => !v)}
                onSelect={onSelectContact}
              />
            )}
          </div>
        </section>

        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f3f3f3]">
          {chat ? (
            <ChatPane
              peer={chat}
              loading={msgLoading}
              messages={messages}
              onBack={leaveChat}
            />
          ) : profile?.kind === 'group' ? (
            <GroupProfile peer={profile} onEnterChat={enterGroupChat} />
          ) : profile ? (
            <FriendDetail peer={profile} onSendMessage={sendMessage} />
          ) : (
            /* 通讯录/通话空态 — Figma 977:23156 右侧灰底居中 Logo */
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f3f3f3]">
              <img
                src={emptyLogo}
                alt=""
                className="pointer-events-none size-20 select-none"
              />
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

function NavIcon({
  active,
  src,
  activeSrc,
  label,
  onClick
}: {
  active: boolean;
  src: string;
  /** 选中态专用图标（线框→实心）；有则不再叠背景/透明度 */
  activeSrc?: string;
  label: string;
  onClick: () => void;
}) {
  const iconSrc = active && activeSrc ? activeSrc : src;
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
      onClick={onClick}
    >
      <img
        src={iconSrc}
        alt=""
        className={`h-[20px] w-[20px] ${
          activeSrc ? 'opacity-100' : active ? 'opacity-100' : 'opacity-55'
        }`}
      />
    </button>
  );
}

function GroupAvatar({
  avatars,
  name,
  size = 32
}: {
  avatars?: string[];
  name: string;
  size?: number;
}) {
  const tiles = (avatars || []).slice(0, 4);
  const palette = ['#7B61FF', '#12D2AC', '#307AF2', '#FF8A65'];
  if (tiles.length >= 4) {
    return (
      <div
        className="grid shrink-0 grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-full bg-[var(--color-fill-2,#eee)]"
        style={{ width: size, height: size }}
      >
        {tiles.map((src, i) => (
          <img key={i} src={src} alt="" className="size-full object-cover" />
        ))}
      </div>
    );
  }
  // 无头像时用色块拼贴，贴近稿里的群头像观感
  return (
    <div
      className="grid shrink-0 grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-full bg-[var(--color-fill-2,#eee)]"
      style={{ width: size, height: size }}
      title={name}
    >
      {palette.map((c, i) => (
        <span key={i} style={{ background: c }} className="block size-full" />
      ))}
    </div>
  );
}

function OnlineAvatar({
  id,
  name,
  src,
  size,
  online
}: {
  id?: string;
  name: string;
  src?: string;
  size: number;
  online?: boolean;
}) {
  return (
    <span className="relative shrink-0">
      <UserAvatar userId={id} name={name} src={src} size={size} />
      {online ? (
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-solid border-white bg-[rgb(var(--success-6))]" />
      ) : null}
    </span>
  );
}

function SessionList({
  items,
  activeId,
  onSelect
}: {
  items: ChatPeer[];
  activeId?: string;
  onSelect: (p: ChatPeer) => void;
}) {
  if (!items.length) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-arco-text-3">
        暂无会话
      </div>
    );
  }
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <li key={item.id}>
            {/* Cell 选中：Figma 791:33254 — 整行 rgba(0,0,0,0.06)，无圆角 */}
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center gap-4 border-0 pl-4 text-left ${
                selected
                  ? 'bg-[rgba(0,0,0,0.06)]'
                  : 'bg-transparent hover:bg-[rgba(0,0,0,0.03)]'
              }`}
              onClick={() => onSelect(item)}
            >
              {item.kind === 'group' ? (
                <GroupAvatar avatars={item.avatars} name={item.name} size={40} />
              ) : (
                <OnlineAvatar
                  id={item.id}
                  name={item.name}
                  src={item.avatar}
                  size={40}
                  online={item.online}
                />
              )}
              <div className="flex min-w-0 flex-1 items-center border-b border-solid border-[rgba(120,120,128,0.12)] py-4 pr-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Text className="!m-0 min-w-0 flex-1 truncate text-[16px] leading-[1.5] !text-arco-text-1">
                      {item.name}
                    </Text>
                    <div className="flex shrink-0 items-center gap-1">
                      {item.muted ? (
                        <IconMute className="text-[12px] text-arco-text-3" />
                      ) : null}
                      <span className="text-[10px] leading-[1.3] text-[rgba(0,0,0,0.4)]">
                        {item.time}
                      </span>
                    </div>
                  </div>
                  <p className="m-0 truncate text-[12px] leading-[1.3] text-[rgba(0,0,0,0.4)]">
                    {item.lastMessage}
                  </p>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** 通讯录分组头 — Figma 977:23156 Cell（行高约 40，箭头与文案间距 4） */
function SectionHeader({
  open,
  title,
  count,
  onToggle
}: {
  open: boolean;
  title: string;
  count?: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-10 w-full cursor-pointer items-center gap-1 border-0 bg-transparent py-0 pl-4 text-left"
      onClick={onToggle}
    >
      {open ? (
        <IconDown className="shrink-0 text-[16px] text-arco-text-2" />
      ) : (
        <IconRight className="shrink-0 text-[16px] text-arco-text-2" />
      )}
      <span className="flex h-full min-w-0 flex-1 items-center gap-3 pr-4">
        <span className="min-w-0 flex-1 truncate text-[16px] leading-[1.5] text-arco-text-1">
          {title}
        </span>
        {count != null ? (
          <span className="shrink-0 text-[12px] leading-[1.3] text-[rgba(0,0,0,0.4)]">
            {count}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function ContactsPanel({
  groupsOnly = false,
  groupsOpen,
  contactsOpen,
  groupCount,
  contactCount,
  groups,
  starred,
  sections,
  activeId,
  onToggleGroups,
  onToggleContacts,
  onSelect
}: {
  /** 群组会话入口仅展示群聊分组（977:23441） */
  groupsOnly?: boolean;
  groupsOpen: boolean;
  contactsOpen: boolean;
  groupCount: number;
  contactCount: number;
  groups: ChatPeer[];
  starred: ChatPeer[];
  sections: ContactSection[];
  activeId?: string;
  onToggleGroups: () => void;
  onToggleContacts: () => void;
  onSelect: (p: ChatPeer) => void;
}) {
  return (
    <div className="flex flex-col pt-2">
      <SectionHeader
        open={groupsOpen}
        title="群聊"
        count={groupsOnly ? undefined : groupCount}
        onToggle={onToggleGroups}
      />
      {groupsOpen
        ? groups.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`flex w-full cursor-pointer items-center gap-4 border-0 py-0 pl-9 pr-0 text-left ${
                g.id === activeId
                  ? 'bg-[rgba(0,0,0,0.06)]'
                  : 'bg-transparent hover:bg-[rgba(0,0,0,0.03)]'
              }`}
              onClick={() => onSelect(g)}
            >
              <GroupAvatar avatars={g.avatars} name={g.name} size={32} />
              <div className="flex min-h-[72px] min-w-0 flex-1 items-center gap-2 border-b border-solid border-[rgba(120,120,128,0.12)] pr-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[16px] text-arco-text-1">
                    {g.name}
                  </div>
                  <div className="truncate text-[12px] text-arco-text-3">
                    {g.sub || `ID：${g.id}`}
                  </div>
                </div>
                {!groupsOnly && g.unread ? (
                  <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--danger-6))] px-1 text-[10px] font-semibold leading-none text-white">
                    {g.unread > 99 ? '99+' : g.unread}
                  </span>
                ) : null}
              </div>
            </button>
          ))
        : null}

      {groupsOnly ? null : (
        <>
          <div className="mt-1">
            <SectionHeader
              open={contactsOpen}
              title="联系人"
              count={contactCount}
              onToggle={onToggleContacts}
            />
          </div>
          {contactsOpen ? (
            <>
              {starred.length ? (
                <>
                  <div className="flex items-center gap-1 py-2 pl-9 pr-4">
                    <img src={iconStar} alt="" className="size-3" />
                    <span className="text-[14px] text-arco-text-2">星标</span>
                  </div>
                  {starred.map((c) => (
                    <ContactRow
                      key={`star-${c.id}`}
                      peer={c}
                      selected={c.id === activeId}
                      onSelect={onSelect}
                    />
                  ))}
                </>
              ) : null}
              {sections.map((sec) => (
                <div key={sec.letter}>
                  <div className="py-2 pl-9 pr-4 text-[14px] text-arco-text-2">
                    {sec.letter}
                  </div>
                  {sec.items.map((c) => (
                    <ContactRow
                      key={c.id}
                      peer={c}
                      selected={c.id === activeId}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              ))}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function ContactRow({
  peer,
  selected,
  onSelect
}: {
  peer: ChatPeer;
  selected: boolean;
  onSelect: (p: ChatPeer) => void;
}) {
  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer items-center gap-4 border-0 py-0 pl-9 pr-0 text-left ${
        selected
          ? 'bg-[rgba(0,0,0,0.06)]'
          : 'bg-transparent hover:bg-[rgba(0,0,0,0.03)]'
      }`}
      onClick={() => onSelect(peer)}
    >
      <OnlineAvatar
        id={peer.id}
        name={peer.name}
        src={peer.avatar}
        size={32}
        online={peer.online}
      />
      <div className="flex min-h-14 min-w-0 flex-1 items-center border-b border-solid border-[rgba(120,120,128,0.12)] pr-4">
        <span className="truncate text-[16px] text-arco-text-1">{peer.name}</span>
      </div>
    </button>
  );
}

/** 通讯录好友详情 — Figma 977:24413 */
function FriendDetail({
  peer,
  onSendMessage
}: {
  peer: ChatPeer;
  onSendMessage: (p: ChatPeer) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#f3f3f3]">
      <div className="flex flex-col items-center gap-4 px-4 pb-4 pt-6">
        <UserAvatar
          size={80}
          userId={peer.id}
          name={peer.name}
          src={peer.avatar}
        />
        <div className="flex flex-col items-center gap-2">
          <p className="m-0 text-center text-[18px] font-medium leading-[1.5] text-arco-text-1">
            {peer.name}
          </p>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-[#eee] px-2 py-1"
            onClick={() => {
              copy(peer.id);
              Message.success('已复制');
            }}
          >
            <span className="text-[12px] leading-none text-[rgb(var(--link-6))]">
              ID：{peer.id}
            </span>
            <IconCopy className="text-[12px] text-[rgb(var(--link-6))]" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button
          type="primary"
          long
          className="!h-12 !rounded-xl !bg-[#7b61ff] !text-[14px] hover:!bg-[#6a52e6]"
          onClick={() => onSendMessage(peer)}
        >
          发消息
        </Button>
      </div>

      <div className="px-4 pb-6">
        <div className="overflow-hidden rounded-xl bg-white">
          <div className="flex items-center border-b border-solid border-[rgba(120,120,128,0.12)] px-4 py-4">
            <span className="flex-1 text-[14px] text-arco-text-1">备注名</span>
            <span className="text-[14px] text-[rgba(0,0,0,0.4)]">
              {peer.remark || '添加备注'}
            </span>
          </div>
          <div className="flex items-center border-b border-solid border-[rgba(120,120,128,0.12)] px-4 py-4">
            <span className="flex-1 text-[14px] text-arco-text-1">来源</span>
            <span className="text-[14px] text-arco-text-2">
              {peer.source || '通过ID添加'}
            </span>
          </div>
          <div className="flex items-center px-4 py-4">
            <span className="flex-1 text-[14px] text-arco-text-1">添加时间</span>
            <span className="text-[14px] text-arco-text-2">
              {peer.addedAt || '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 通讯录群详情 — Figma 977:23441 / 977:23257 */
function GroupProfile({
  peer,
  onEnterChat
}: {
  peer: ChatPeer;
  onEnterChat: (p: ChatPeer) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center overflow-y-auto bg-[#f3f3f3] px-20">
      <div className="h-14 w-full shrink-0" />
      <div className="flex w-full flex-col items-center pb-4">
        <div className="flex flex-col items-center gap-4">
          <GroupAvatar avatars={peer.avatars} name={peer.name} size={80} />
          <div className="flex flex-col items-center gap-2">
            <p className="m-0 text-center text-[18px] font-medium leading-[1.5] text-arco-text-1">
              {peer.name}
            </p>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-[#eee] px-2 py-1"
              onClick={() => {
                copy(peer.id);
                Message.success('已复制');
              }}
            >
              <span className="text-[12px] leading-none text-[rgb(var(--link-6))]">
                ID：{peer.id}
              </span>
              <IconCopy className="text-[16px] text-[rgb(var(--link-6))]" />
            </button>
          </div>
        </div>
      </div>
      <div className="w-full p-4">
        <Button
          type="primary"
          long
          className="!h-12 !rounded-xl !bg-[#7b61ff] !text-[14px] !font-medium hover:!bg-[#6a52e6]"
          onClick={() => onEnterChat(peer)}
        >
          进入群聊
        </Button>
      </div>
    </div>
  );
}

/** 聊天区 — 单聊 791:32208 / 群聊 791:33221；搜索进入查看聊天记录 791:35472 */
function ChatPane({
  peer,
  loading,
  messages,
  onBack
}: {
  peer: ChatPeer;
  loading: boolean;
  messages: ChatMsg[];
  onBack: () => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  /** 从聊天记录定位回来时优先滚到目标，避免被「滚到底」覆盖 */
  const pendingScrollMsgId = useRef<string | null>(null);
  const isGroup = peer.kind === 'group';
  const title =
    isGroup && peer.memberCount
      ? `${peer.name} (${peer.memberCount})`
      : peer.name;

  useEffect(() => {
    if (historyOpen || loading || !messages.length) return;
    const locateId = pendingScrollMsgId.current;
    pendingScrollMsgId.current = null;

    const scrollToLatest = () => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    };

    const scrollToTarget = () => {
      if (locateId) {
        const safeId =
          typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
            ? CSS.escape(locateId)
            : locateId.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const node = scrollerRef.current?.querySelector(
          `[data-msg-id="${safeId}"]`
        );
        if (node instanceof HTMLElement) {
          node.scrollIntoView({ block: 'center' });
          return;
        }
      }
      scrollToLatest();
    };

    requestAnimationFrame(() => {
      scrollToTarget();
      requestAnimationFrame(scrollToTarget);
    });
    const t = window.setTimeout(scrollToTarget, 80);
    return () => window.clearTimeout(t);
  }, [historyOpen, loading, messages.length, peer.id]);

  if (historyOpen) {
    return (
      <ChatHistoryPanel
        chatType={isGroup ? 'group' : 'user'}
        chatId={peer.id}
        onClose={() => setHistoryOpen(false)}
        onLocate={(messageId) => {
          if (messages.some((m) => m.id === messageId)) {
            pendingScrollMsgId.current = messageId;
          } else {
            Message.success('已回到会话');
          }
          setHistoryOpen(false);
        }}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f3f3f3]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-solid border-[rgba(120,120,128,0.12)] bg-[#f3f3f3] px-4">
        <button
          type="button"
          aria-label="返回"
          className="inline-flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-1"
          onClick={onBack}
        >
          <IconRight className="rotate-180 text-[16px]" />
        </button>
        {isGroup ? (
          <GroupAvatar avatars={peer.avatars} name={peer.name} size={32} />
        ) : (
          <UserAvatar
            size={32}
            userId={peer.id}
            name={peer.name}
            src={peer.avatar}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-medium leading-[18px] text-arco-text-1">
            {title}
          </div>
          {isGroup && peer.onlineCount != null ? (
            <div className="mt-0.5 flex items-center gap-1 text-[12px] leading-3 text-arco-text-3">
              <span className="size-2 rounded-full bg-[rgb(var(--success-6))]" />
              {peer.onlineCount}人在线
            </div>
          ) : !isGroup ? (
            <div className="mt-0.5 flex items-center gap-1 text-[12px] leading-3 text-arco-text-3">
              <span
                className={`size-2 rounded-full ${
                  peer.online === false
                    ? 'bg-[var(--color-text-4,#c9cdd4)]'
                    : 'bg-[rgb(var(--success-6))]'
                }`}
              />
              {peer.online === false ? '离线' : '在线'}
            </div>
          ) : null}
        </div>
        {/* 单聊顶栏右侧仅搜索（Figma 791:32242 phone/video opacity:0） */}
        <button
          type="button"
          aria-label="查看聊天记录"
          className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[20px] text-arco-text-2"
          onClick={() => setHistoryOpen(true)}
        >
          <IconSearch />
        </button>
      </header>

      <Alert
        type="warning"
        showIcon
        className="use-user-chat-alert shrink-0"
        content="只读模式：您正在以管理员权限查看用户通讯记录。系统仅保留最近 180 天的消息内容。所有查阅操作均已记录在审计日志中，请遵守隐私合规规范。"
      />

      {/* absolute 铺满剩余高度，避开 flex 百分比高度失效 */}
      <div className="use-chat-msg-list-host">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spin />
          </div>
        ) : (
          <div ref={scrollerRef} className="use-chat-msg-list">
            <div className="use-chat-msg-list-inner">
              {messages.map((item, index) => (
                <div
                  key={item.id}
                  data-msg-id={item.id}
                  className={`use-chat-msg-row${
                    index === messages.length - 1 ? ' use-chat-msg-row--last' : ''
                  }`}
                >
                  <MessageRow msg={item} isGroup={isGroup} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageRow({
  msg,
  isGroup
}: {
  msg: ChatMsg;
  isGroup: boolean;
}) {
  if (msg.msgType === 'date') {
    const label = msg.dateLabel || msg.content || '';
    const relative = /昨天|今天|星期|更早/.test(label);
    return (
      <div className="flex justify-center px-4 py-1">
        {relative ? (
          <span className="rounded-xl px-1 text-[12px] leading-[1.3] text-[rgba(0,0,0,0.4)]">
            {label}
          </span>
        ) : (
          <span className="rounded-full bg-black px-1.5 py-1 text-[12px] leading-none text-white">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (msg.msgType === 'system') {
    return (
      <div className="px-4 py-1 text-center text-[12px] leading-4 text-[rgba(0,0,0,0.4)]">
        {msg.content}
      </div>
    );
  }

  const isSelf = msg.side === 'self';
  /** 群聊对方：行内头像；昵称在气泡内（Figma 791:33286）。单聊不展示。 */
  const showPeerAvatar = isGroup && !isSelf;
  const senderName = showPeerAvatar ? msg.senderName : undefined;

  return (
    <div
      className={`flex items-end px-4 py-1 ${
        isSelf
          ? 'justify-end pl-[120px]'
          : showPeerAvatar
            ? 'justify-start gap-1'
            : 'justify-start pr-[120px]'
      }`}
    >
      {showPeerAvatar ? (
        <UserAvatar
          size={24}
          className="shrink-0"
          userId={msg.senderId}
          name={msg.senderName}
          src={msg.senderAvatar}
        />
      ) : null}
      <Bubble msg={msg} isSelf={isSelf} senderName={senderName} />
    </div>
  );
}

function BubbleSenderName({ name }: { name?: string }) {
  if (!name) return null;
  return (
    <p className="m-0 text-[10px] font-medium leading-[1.5] text-[rgba(0,0,0,0.6)]">
      {name}
    </p>
  );
}

/** 转发头 — Figma 1092:34877 */
function ForwardHeader({
  name,
  avatar,
  isSelf
}: {
  name?: string;
  avatar?: string;
  isSelf: boolean;
}) {
  if (!name) return null;
  return (
    <div
      className={`mb-1 flex items-center gap-1 text-[10px] leading-none ${
        isSelf ? 'text-white' : 'text-[rgba(0,0,0,0.6)]'
      }`}
    >
      <span>转发自</span>
      <UserAvatar size={12} className="shrink-0" name={name} src={avatar} />
      <span className="truncate">{name}</span>
    </div>
  );
}

/** 链接高亮：己方浅蓝 #b5c7ff（Figma 1092:35131） */
function BubbleText({ text, isSelf }: { text?: string; isSelf: boolean }) {
  const raw = text || '';
  const parts = raw.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi);
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        /^(https?:\/\/|www\.)/i.test(part) ? (
          <span
            key={i}
            className={isSelf ? 'text-[#b5c7ff]' : 'text-[rgb(var(--link-6))]'}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function fileExtBadge(name?: string): { label: string; color: string } {
  const ext = (name || '').split('.').pop()?.toLowerCase() || '';
  if (['doc', 'docx'].includes(ext)) return { label: 'DOC', color: '#0072a2' };
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return { label: 'XLS', color: '#1d6f42' };
  if (ext === 'pdf') return { label: 'PDF', color: '#c62828' };
  if (['ppt', 'pptx'].includes(ext)) return { label: 'PPT', color: '#d24726' };
  if (['zip', 'rar', '7z'].includes(ext))
    return { label: 'ZIP', color: '#6a1b9a' };
  return { label: (ext || 'FILE').slice(0, 4).toUpperCase(), color: '#546e7a' };
}

/** 同时只播一条语音 */
let activeVoiceAudio: HTMLAudioElement | null = null;
let activeVoiceStop: (() => void) | null = null;

function stopActiveVoice() {
  activeVoiceStop?.();
  activeVoiceStop = null;
  activeVoiceAudio = null;
}

/** 图片气泡：点击预览原图 */
function ImageBubble({ msg }: { msg: ChatMsg }) {
  const [preview, setPreview] = useState(false);
  const thumb = msg.thumbnailUrl || msg.mediaUrl;
  const full = msg.mediaUrl || msg.thumbnailUrl;

  return (
    <>
      <button
        type="button"
        className="relative m-0 max-w-[180px] cursor-zoom-in overflow-hidden rounded-xl border-0 bg-[#eee] p-0"
        disabled={!full}
        onClick={() => full && setPreview(true)}
        aria-label="预览图片"
      >
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="block max-h-[240px] w-full object-cover"
          />
        ) : (
          <div className="flex size-[180px] items-center justify-center text-center text-[12px] text-arco-text-3">
            图片
          </div>
        )}
        <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/35 px-1">
          <BubbleMeta time={msg.time} isSelf />
        </span>
      </button>
      {full ? (
        <Image.Preview
          src={full}
          visible={preview}
          onVisibleChange={setPreview}
          getPopupContainer={() => document.body}
        />
      ) : null}
    </>
  );
}

/** 视频气泡：点击弹层播放 */
function VideoBubble({ msg }: { msg: ChatMsg }) {
  const [open, setOpen] = useState(false);
  const src = msg.mediaUrl;

  return (
    <>
      <button
        type="button"
        className="relative m-0 flex size-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 bg-[rgba(0,0,0,0.45)] p-0 text-white"
        disabled={!src}
        onClick={() => {
          if (!src) {
            Message.warning('暂无视频地址');
            return;
          }
          setOpen(true);
        }}
        aria-label="预览视频"
      >
        {msg.thumbnailUrl ? (
          <img
            src={msg.thumbnailUrl}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-80"
          />
        ) : null}
        <img src={iconChatPlay} alt="" className="relative z-[1] size-10" />
        <span className="pointer-events-none absolute bottom-2 right-2">
          <BubbleMeta time={msg.time} isSelf />
        </span>
      </button>
      <Modal
        visible={open}
        onCancel={() => setOpen(false)}
        footer={null}
        closable
        unmountOnExit
        maskClosable
        className="use-chat-video-preview-modal"
        wrapClassName="use-chat-video-preview-modal-wrap"
        style={{ width: 'min(720px, 92vw)' }}
      >
        {src ? (
          <video
            key={src}
            src={src}
            controls
            autoPlay
            playsInline
            className="block max-h-[70vh] w-full bg-black"
          />
        ) : null}
      </Modal>
    </>
  );
}

/** 语音图标：基于设计稿 SVG，播放时两道声波由内向外依次亮起 */
function VoiceWaveIcon({
  isSelf,
  playing
}: {
  isSelf: boolean;
  playing: boolean;
}) {
  return (
    <span
      className={`use-chat-voice-wave${playing ? ' is-playing' : ''}${
        isSelf ? ' is-self' : ''
      }`}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        {/* 圆点主体，始终显示 */}
        <path
          className="use-chat-voice-wave__body"
          d="M3.96847 9.23703C3.35007 9.23703 2.84863 8.73575 2.84863 8.11711C2.84863 7.49839 3.34999 6.99719 3.96847 6.99719C4.58735 6.99719 5.08847 7.49839 5.08847 8.11711C5.08847 8.73575 4.58735 9.23703 3.96847 9.23703Z"
        />
        {/* 内弧 */}
        <path
          className="use-chat-voice-wave__arc use-chat-voice-wave__arc--1"
          d="M7.44325 11.5961C7.17377 11.8328 6.77131 11.7907 6.51764 11.5371C6.16585 11.1853 6.25495 10.5902 6.6018 10.2336C7.19005 9.62877 7.55239 8.80353 7.55239 7.89303C7.55239 7.07078 7.25658 6.31808 6.76584 5.73438C6.4604 5.37108 6.40172 4.8131 6.73737 4.4775C7.00799 4.20692 7.44275 4.17603 7.71071 4.44925C8.58154 5.33716 9.12023 6.55117 9.12023 7.89303C9.12023 9.36888 8.47132 10.6928 7.44325 11.5961Z"
        />
        {/* 外弧 */}
        <path
          className="use-chat-voice-wave__arc use-chat-voice-wave__arc--2"
          d="M10.4676 14.4595C10.1819 14.7517 9.71555 14.7343 9.42657 14.4453C9.107 14.1257 9.13034 13.6036 9.44084 13.2752C10.7682 11.8712 11.5845 9.97954 11.5845 7.89458C11.5845 5.91313 10.8451 4.10817 9.63216 2.72909C9.33951 2.39636 9.32656 1.88761 9.63989 1.57428C9.93818 1.27599 10.4222 1.26624 10.7059 1.57841C12.2229 3.24735 13.1518 5.45936 13.1518 7.89234C13.1518 10.4505 12.1256 12.7645 10.4676 14.4595Z"
        />
      </svg>
    </span>
  );
}

function VoiceBubble({
  msg,
  isSelf,
  wrap
}: {
  msg: ChatMsg;
  isSelf: boolean;
  wrap: (inner: React.ReactNode, opts?: { stretch?: boolean }) => React.ReactNode;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      if (audioRef.current && activeVoiceAudio === audioRef.current) {
        stopActiveVoice();
      } else {
        audioRef.current?.pause();
      }
    },
    []
  );

  const togglePlay = () => {
    const url = msg.mediaUrl;
    if (!url) {
      Message.warning('暂无语音地址');
      return;
    }

    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      if (activeVoiceAudio) {
        activeVoiceAudio = null;
        activeVoiceStop = null;
      }
      setPlaying(false);
      return;
    }

    stopActiveVoice();
    const audio = new Audio(url);
    audioRef.current = audio;
    activeVoiceAudio = audio;
    activeVoiceStop = () => {
      audio.pause();
      audioRef.current = null;
      setPlaying(false);
    };

    audio.onended = () => {
      setPlaying(false);
      if (activeVoiceAudio === audio) {
        activeVoiceAudio = null;
        activeVoiceStop = null;
      }
      audioRef.current = null;
    };
    audio.onerror = () => {
      Message.error('语音播放失败');
      setPlaying(false);
      if (activeVoiceAudio === audio) {
        activeVoiceAudio = null;
        activeVoiceStop = null;
      }
      audioRef.current = null;
    };

    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        Message.error('语音播放失败');
        setPlaying(false);
        if (activeVoiceAudio === audio) {
          activeVoiceAudio = null;
          activeVoiceStop = null;
        }
        audioRef.current = null;
      });
  };

  const duration = (
    <span className="tabular-nums">{msg.duration || msg.content || '1"'}</span>
  );
  const icon = <VoiceWaveIcon isSelf={isSelf} playing={playing} />;

  return (
    <>
      {wrap(
        <button
          type="button"
          className="use-chat-voice-btn m-0 inline-flex cursor-pointer items-end gap-2 border-0 bg-transparent p-0"
          onClick={togglePlay}
          aria-label={playing ? '暂停语音' : '播放语音'}
        >
          <span className="inline-flex items-center gap-2">
            {isSelf ? (
              <>
                {duration}
                {icon}
              </>
            ) : (
              <>
                {icon}
                {duration}
              </>
            )}
          </span>
          <BubbleMeta time={msg.time} isSelf={isSelf} />
        </button>
      )}
    </>
  );
}

function Bubble({
  msg,
  isSelf,
  senderName
}: {
  msg: ChatMsg;
  isSelf: boolean;
  /** 群聊对方昵称，渲染在气泡内顶部 */
  senderName?: string;
}) {
  const withName = Boolean(senderName);
  const shell = bubbleShell(isSelf, withName);
  const rejected = Boolean(msg.callStatus?.includes('拒绝'));
  const isVideo =
    msg.callKind === 'video' ||
    msg.content?.includes('视频') ||
    msg.callStatus?.includes('视频');

  const wrap = (inner: React.ReactNode, opts?: { stretch?: boolean }) => (
    <div
      className={`${bubbleShell(isSelf, true)} ${
        opts?.stretch ? 'min-w-[100px] items-stretch' : ''
      } relative w-fit max-w-full`}
    >
      <BubbleSenderName name={senderName} />
      <ForwardHeader
        name={msg.forwardFromName}
        avatar={msg.forwardFromAvatar}
        isSelf={isSelf}
      />
      {inner}
      <BubbleTail isSelf={isSelf} />
    </div>
  );

  if (msg.msgType === 'image') {
    return <ImageBubble msg={msg} />;
  }

  if (msg.msgType === 'video') {
    return <VideoBubble msg={msg} />;
  }

  if (msg.msgType === 'voice') {
    return <VoiceBubble msg={msg} isSelf={isSelf} wrap={wrap} />;
  }

  if (msg.msgType === 'file') {
    const badge = fileExtBadge(msg.fileName || msg.content);
    return wrap(
      <>
        <div className="flex items-center gap-1">
          <span
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-[3px] text-[8px] font-semibold text-white"
            style={{ background: badge.color }}
          >
            {badge.label}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] leading-[1.3]">
              {msg.fileName || msg.content}
            </div>
            <div
              className={`text-[12px] leading-[1.3] ${
                isSelf ? 'text-white/40' : 'text-[rgba(0,0,0,0.4)]'
              }`}
            >
              {msg.fileSize || ''}
            </div>
          </div>
        </div>
        <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
          <BubbleMeta time={msg.time} isSelf={isSelf} />
        </div>
      </>,
      { stretch: true }
    );
  }

  if (msg.msgType === 'call') {
    const label = rejected
      ? msg.callStatus || '已拒绝'
      : msg.duration || msg.content || '通话';
    let iconSrc = isSelf ? iconChatPhoneSelf : iconChatPhonePeer;
    if (rejected) {
      iconSrc = isVideo
        ? isSelf
          ? iconChatVideoOffSelf
          : iconChatVideoOffPeer
        : isSelf
          ? iconChatPhoneDisabledSelf
          : iconChatPhoneDisabledPeer;
    } else if (isVideo) {
      iconSrc = isSelf ? iconChatVideoSelf : iconChatVideoPeer;
    }
    return wrap(
      <div className="inline-flex items-end gap-2">
        <span className="inline-flex items-center gap-2">
          {isSelf ? (
            <>
              <span>{label}</span>
              <img src={iconSrc} alt="" className="size-4" />
            </>
          ) : (
            <>
              <img src={iconSrc} alt="" className="size-4" />
              <span>{label}</span>
            </>
          )}
        </span>
        <BubbleMeta time={msg.time} isSelf={isSelf} />
      </div>
    );
  }

  if (msg.msgType === 'location') {
    return wrap(
      <>
        <div className="w-[200px] overflow-hidden rounded-lg bg-[rgba(0,0,0,0.06)]">
          <div className="flex h-[88px] items-center justify-center bg-gradient-to-b from-[#dfe9f5] to-[#c5d4e8] text-[12px] text-arco-text-3">
            地图
          </div>
          <div className="border-t border-solid border-[rgba(120,120,128,0.12)] px-2 py-1.5">
            <div className="truncate text-[14px] leading-[1.3] text-arco-text-1">
              {msg.locationName || msg.content || '位置'}
            </div>
            {msg.locationAddress ? (
              <div className="truncate text-[12px] leading-[1.3] text-[rgba(0,0,0,0.4)]">
                {msg.locationAddress}
              </div>
            ) : null}
          </div>
        </div>
        <BubbleMeta time={msg.time} isSelf={isSelf} />
      </>
    );
  }

  if (msg.msgType === 'card') {
    const isGroup = msg.cardKind === 'group';
    const action = isSelf ? '去聊天' : isGroup ? '加入群' : '发消息';
    return wrap(
      <>
        <div className="w-[232px] overflow-hidden rounded-lg bg-[rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-2 border-b border-solid border-[rgba(120,120,128,0.12)] px-2 py-2">
            <div className="flex items-start gap-2">
              {isGroup ? (
                <GroupAvatar
                  name={msg.cardName || msg.content || '群'}
                  size={32}
                />
              ) : (
                <UserAvatar
                  size={32}
                  userId={msg.cardId}
                  name={msg.cardName}
                  src={msg.cardAvatar}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] leading-none text-arco-text-1">
                  {msg.cardName || msg.content || '--'}
                </div>
                <div className="mt-1 truncate text-[12px] leading-none text-[rgba(0,0,0,0.4)]">
                  ID：{msg.cardId || '--'}
                </div>
              </div>
            </div>
            {msg.cardDesc ? (
              <p className="m-0 line-clamp-3 text-[12px] leading-[1.5] text-[rgba(0,0,0,0.6)]">
                {msg.cardDesc}
              </p>
            ) : null}
          </div>
          <div className="py-2 text-center text-[12px] leading-none text-arco-text-1">
            {action}
          </div>
        </div>
        <BubbleMeta time={msg.time} isSelf={isSelf} />
      </>
    );
  }

  if (msg.msgType === 'quote') {
    return wrap(
      <>
        <div
          className={`mb-0.5 w-full rounded border-l-2 px-1 text-[12px] leading-[1.5] ${
            isSelf
              ? 'border-[#b5c7ff] bg-white/20'
              : 'border-[rgba(0,0,0,0.2)] bg-[rgba(0,0,0,0.06)]'
          }`}
        >
          {msg.quoteSender ? (
            <div
              className={`truncate ${
                isSelf ? 'text-[#b5c7ff]' : 'text-[rgba(0,0,0,0.4)]'
              }`}
            >
              {msg.quoteSender}
            </div>
          ) : null}
          <div
            className={`truncate ${
              isSelf ? 'text-white' : 'text-[rgba(0,0,0,0.6)]'
            }`}
          >
            {msg.quoteText || '引用消息'}
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="m-0 min-w-0">
            <BubbleText text={msg.content} isSelf={isSelf} />
          </p>
          <BubbleMeta time={msg.time} isSelf={isSelf} />
        </div>
      </>,
      { stretch: true }
    );
  }

  if (msg.msgType === 'merger') {
    return wrap(
      <>
        <div className="min-w-[160px]">
          <div className="text-[14px] font-medium leading-[1.3]">
            {msg.content || '合并消息'}
          </div>
          {msg.quoteText ? (
            <pre
              className={`m-0 mt-1 whitespace-pre-wrap text-[12px] leading-[1.4] ${
                isSelf ? 'text-white/70' : 'text-[rgba(0,0,0,0.4)]'
              }`}
            >
              {msg.quoteText}
            </pre>
          ) : null}
        </div>
        <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
          <BubbleMeta time={msg.time} isSelf={isSelf} />
        </div>
      </>,
      { stretch: true }
    );
  }

  /* 短文：文案与时间并排；长文：时间贴右下角（Figma 977:24119 / 1092:33280） */
  const longText = (msg.content || '').length > 40;
  if (longText) {
    return (
      <div
        className={`${bubbleShell(isSelf, true)} ${
          withName ? '' : '!gap-0'
        } relative w-fit max-w-full`}
      >
        <BubbleSenderName name={senderName} />
        <ForwardHeader
          name={msg.forwardFromName}
          avatar={msg.forwardFromAvatar}
          isSelf={isSelf}
        />
        <p className="m-0 pr-[52px] pb-0">
          <BubbleText text={msg.content} isSelf={isSelf} />
        </p>
        <span className="absolute bottom-2 right-2">
          <BubbleMeta time={msg.time} isSelf={isSelf} />
        </span>
        <BubbleTail isSelf={isSelf} />
      </div>
    );
  }

  return (
    <div className={shell}>
      <BubbleSenderName name={senderName} />
      <ForwardHeader
        name={msg.forwardFromName}
        avatar={msg.forwardFromAvatar}
        isSelf={isSelf}
      />
      {withName || msg.forwardFromName ? (
        <div className="inline-flex max-w-full items-end gap-2">
          <p className="m-0 min-w-0">
            <BubbleText text={msg.content} isSelf={isSelf} />
          </p>
          <BubbleMeta time={msg.time} isSelf={isSelf} />
        </div>
      ) : (
        <>
          <p className="m-0 min-w-0">
            <BubbleText text={msg.content} isSelf={isSelf} />
          </p>
          <BubbleMeta time={msg.time} isSelf={isSelf} />
        </>
      )}
      <BubbleTail isSelf={isSelf} />
    </div>
  );
}
