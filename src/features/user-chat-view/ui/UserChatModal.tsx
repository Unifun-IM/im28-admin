import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Input,
  List,
  Message,
  Modal,
  Spin,
  Typography
} from '@arco-design/web-react';
import type { ListHandle } from '@arco-design/web-react/es/List/interface';
import {
  IconCopy,
  IconDown,
  IconFile,
  IconMute,
  IconPhone,
  IconPlayArrowFill,
  IconPlus,
  IconRight,
  IconSearch,
  IconSound,
  IconVideoCamera
} from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import { getChatMessages, getUserChatBook } from '@shared/api/biz';
import emptyLogo from '../assets/chat-empty-logo.svg';
import iconClose from '../assets/icon-close.svg';
import iconContacts from '../assets/icon-contacts.svg';
import iconPhone from '../assets/icon-phone.svg';
import iconSession from '../assets/icon-session.svg';
import iconStar from '../assets/icon-star.svg';
import ChatHistoryPanel from './ChatHistoryPanel';
import useElementHeight from './useElementHeight';
import './user-chat-modal.less';

const { Text } = Typography;

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
};

type ChatPeer = {
  id: string;
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
   * - user：用户会话查询进入，默认通讯录空态
   * - group：群组会话查询进入，默认打开 target 群聊
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
  msgType: 'text' | 'voice' | 'file' | 'call' | 'date' | 'system' | 'image' | 'video';
  content?: string;
  senderName?: string;
  senderAvatar?: string;
  time?: string;
  duration?: string;
  fileName?: string;
  fileSize?: string;
  callStatus?: string;
  dateLabel?: string;
};

/**
 * 查聊天 Modal（单聊 / 群聊共用）
 * 用 scene + target 区分入口：
 * - scene=user：791:30435 / 791:36214 / 791:32208
 * - scene=group：791:30959 / 791:33221
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
  const [nav, setNav] = useState<NavTab>(
    scene === 'group' || target ? 'sessions' : 'contacts'
  );
  const [keyword, setKeyword] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [book, setBook] = useState<ChatBook | null>(null);
  const [groupsOpen, setGroupsOpen] = useState(scene === 'group');
  const [contactsOpen, setContactsOpen] = useState(true);
  /** 通讯录选中的好友/群（右侧资料卡） */
  const [profile, setProfile] = useState<ChatPeer | null>(null);
  /** 会话/发消息/进入群聊打开的聊天 */
  const [chat, setChat] = useState<ChatPeer | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const targetToPeer = (t: ChatModalTarget): ChatPeer => ({
    id: t.id,
    name: t.name || t.id,
    memberCount: t.memberCount,
    onlineCount: t.onlineCount,
    online: t.online,
    kind: t.type === 'group' ? 'group' : 'session'
  });

  useEffect(() => {
    if (!visible || !userId) return;
    const startNav: NavTab =
      scene === 'group' || target ? 'sessions' : 'contacts';
    setNav(startNav);
    setKeyword('');
    setGroupsOpen(scene === 'group');
    setContactsOpen(true);
    setProfile(null);
    setChat(target ? targetToPeer(target) : null);
    setMessages([]);
    setBookLoading(true);
    getUserChatBook(userId)
      .then((res) => {
        const data = res as unknown as ChatBook;
        setBook(data);
        if (target) {
          if (target.type === 'group') {
            const g = data.groups.find((x) => x.id === target.id);
            if (g) setChat(g);
            else setChat(targetToPeer(target));
            return;
          }
          const s = data.sessions.find((x) => x.id === target.id);
          if (s) setChat(s);
          else setChat(targetToPeer(target));
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
  }, [visible, userId, scene, target?.id, target?.type]);

  useEffect(() => {
    if (!visible || !chat) {
      setMessages([]);
      return;
    }
    setMsgLoading(true);
    getChatMessages({
      type: chat.kind === 'group' ? 'group' : 'user',
      id: chat.id,
      page: 1,
      pageSize: 80
    })
      .then((res) => setMessages((res.list || []) as unknown as ChatMsg[]))
      .finally(() => setMsgLoading(false));
  }, [visible, chat]);

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

  /** 群详情「进入群聊」→ 切到会话 Tab 并打开群聊 */
  const enterGroupChat = (peer: ChatPeer) => {
    const sessionPeer: ChatPeer = {
      ...peer,
      kind: 'group',
      lastMessage: peer.lastMessage || '进入群聊',
      time: peer.time || '刚刚',
      unread: 0
    };
    setProfile(null);
    setNav('sessions');
    setKeyword('');
    setChat(sessionPeer);
    upsertSession(sessionPeer);
  };

  const searchPlaceholder =
    nav === 'sessions'
      ? '搜索好友'
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
      className="use-user-chat-modal"
      wrapClassName="use-user-chat-modal-wrap"
      style={{ width: 'min(1024px, 90vw)' }}
    >
      <div className="flex h-[min(768px,90vh)] max-h-[90vh] w-full overflow-hidden rounded-[24px] bg-[#f3f3f3]">
        <aside className="flex w-16 shrink-0 flex-col items-center justify-between border-r border-solid border-[rgba(120,120,128,0.12)] bg-[#f3f3f3] px-2 py-3">
          <div className="flex w-full flex-col items-center gap-8">
            <button
              type="button"
              aria-label="关闭"
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border-0 bg-[#e5e6eb] p-0"
              onClick={onClose}
            >
              <img src={iconClose} alt="" className="size-5" />
            </button>
            <div className="flex flex-col items-center gap-4">
              <Avatar size={40} className="shrink-0">
                {userAvatar ? (
                  <img alt="" src={userAvatar} />
                ) : (
                  (userNickname || 'U').slice(0, 1)
                )}
              </Avatar>
              <NavIcon
                active={nav === 'sessions'}
                src={iconSession}
                label="会话"
                onClick={() => switchNav('sessions')}
              />
              <NavIcon
                active={nav === 'contacts'}
                src={iconContacts}
                label="通讯录"
                onClick={() => switchNav('contacts')}
              />
              <NavIcon
                active={nav === 'calls'}
                src={iconPhone}
                label="通话"
                onClick={() => switchNav('calls')}
              />
            </div>
          </div>
        </aside>

        <section className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r border-solid border-[rgba(120,120,128,0.12)] bg-[#fafafa]">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-solid border-[rgba(120,120,128,0.12)] px-4 py-2">
            <Input
              allowClear
              value={keyword}
              onChange={setKeyword}
              placeholder={searchPlaceholder}
              prefix={<IconSearch className="text-arco-text-3" />}
              className="use-user-chat-search min-w-0 flex-1"
            />
            {nav === 'contacts' ? (
              <button
                type="button"
                aria-label="添加"
                className="inline-flex size-8 shrink-0 cursor-default items-center justify-center rounded-md border-0 bg-[#f0f0f0] p-0 text-arco-text-2"
              >
                <IconPlus className="text-[16px]" />
              </button>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {bookLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spin />
              </div>
            ) : nav === 'sessions' ? (
              <SessionList
                items={filteredSessions}
                activeId={listActiveId}
                onSelect={onSelectSession}
              />
            ) : nav === 'calls' ? (
              <div className="px-4 py-10 text-center text-[14px] text-arco-text-3">
                暂无通话记录
              </div>
            ) : (
              <ContactsPanel
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

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f3f3f3]">
          {chat ? (
            <ChatPane
              peer={chat}
              loading={msgLoading}
              messages={messages}
              onBack={() => setChat(null)}
            />
          ) : profile?.kind === 'group' ? (
            <GroupProfile peer={profile} onEnterChat={enterGroupChat} />
          ) : profile ? (
            <FriendDetail peer={profile} onSendMessage={sendMessage} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <img src={emptyLogo} alt="" className="size-20" />
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
  label,
  onClick
}: {
  active: boolean;
  src: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-0 p-0 ${
        active ? 'bg-[rgba(0,0,0,0.06)]' : 'bg-transparent'
      }`}
      onClick={onClick}
    >
      <img
        src={src}
        alt=""
        className={`size-5 ${active ? 'opacity-100' : 'opacity-55'}`}
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
  name,
  size,
  online
}: {
  name: string;
  size: number;
  online?: boolean;
}) {
  return (
    <span className="relative shrink-0">
      <Avatar size={size}>{name.slice(0, 1)}</Avatar>
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
            <button
              type="button"
              className={`flex w-full cursor-pointer items-center gap-4 border-0 px-4 py-3 text-left ${
                selected
                  ? 'bg-[rgba(0,0,0,0.06)]'
                  : 'bg-transparent hover:bg-[rgba(0,0,0,0.03)]'
              }`}
              onClick={() => onSelect(item)}
            >
              {item.kind === 'group' ? (
                <GroupAvatar avatars={item.avatars} name={item.name} size={40} />
              ) : (
                <OnlineAvatar name={item.name} size={40} online={item.online} />
              )}
              <div className="min-w-0 flex-1 border-b border-solid border-[rgba(120,120,128,0.12)] pb-3 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1">
                    <Text className="!m-0 truncate text-[16px] !text-arco-text-1">
                      {item.name}
                    </Text>
                    {item.muted ? (
                      <IconMute className="shrink-0 text-[14px] text-arco-text-3" />
                    ) : null}
                  </div>
                  <span className="shrink-0 text-[12px] text-arco-text-3">
                    {item.time}
                  </span>
                </div>
                <p className="m-0 truncate text-[12px] leading-[1.3] text-arco-text-3">
                  {item.lastMessage}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SectionHeader({
  open,
  title,
  count,
  onToggle
}: {
  open: boolean;
  title: string;
  count: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full cursor-pointer items-center gap-1 border-0 bg-transparent py-2 pl-4 pr-4 text-left"
      onClick={onToggle}
    >
      {open ? (
        <IconDown className="text-[16px] text-arco-text-2" />
      ) : (
        <IconRight className="text-[16px] text-arco-text-2" />
      )}
      <span className="flex-1 text-[16px] text-arco-text-1">{title}</span>
      <span className="text-[12px] text-arco-text-3">{count}</span>
    </button>
  );
}

function ContactsPanel({
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
    <div>
      <SectionHeader
        open={groupsOpen}
        title="群聊"
        count={groupCount}
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
                {g.unread ? (
                  <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--danger-6))] px-1 text-[10px] font-semibold leading-none text-white">
                    {g.unread > 99 ? '99+' : g.unread}
                  </span>
                ) : null}
              </div>
            </button>
          ))
        : null}

      <SectionHeader
        open={contactsOpen}
        title="联系人"
        count={contactCount}
        onToggle={onToggleContacts}
      />
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
      <OnlineAvatar name={peer.name} size={32} online={peer.online} />
      <div className="flex min-h-14 min-w-0 flex-1 items-center border-b border-solid border-[rgba(120,120,128,0.12)] pr-4">
        <span className="truncate text-[16px] text-arco-text-1">{peer.name}</span>
      </div>
    </button>
  );
}

/** 通讯录好友详情 — Figma 791:36214 */
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
        <Avatar size={80}>{peer.name.slice(0, 1)}</Avatar>
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
          className="!h-12 !rounded-xl !text-[14px]"
          onClick={() => onSendMessage(peer)}
        >
          发消息
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-6">
        <div className="overflow-hidden rounded-xl bg-[var(--color-bg-2,#fff)]">
          <div className="flex items-center px-4 py-4">
            <span className="flex-1 text-[14px] text-arco-text-1">备注名</span>
            <span className="text-[14px] text-arco-text-3">
              {peer.remark || '添加备注'}
            </span>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl bg-[var(--color-bg-2,#fff)]">
          <div className="flex items-center border-b border-solid border-[rgba(120,120,128,0.12)] px-4 py-4">
            <span className="flex-1 text-[14px] text-arco-text-1">来源</span>
            <span className="text-[14px] text-arco-text-2">
              {peer.source || '通过ID添加'}
            </span>
          </div>
          <div className="flex items-center px-4 py-4">
            <span className="flex-1 text-[14px] text-arco-text-1">添加时间</span>
            <span className="text-[14px] text-arco-text-2">
              {peer.addedAt || '2025年11月'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 通讯录群详情 — Figma 791:31168 */
function GroupProfile({
  peer,
  onEnterChat
}: {
  peer: ChatPeer;
  onEnterChat: (p: ChatPeer) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center overflow-y-auto bg-[#f3f3f3] px-20">
      {/* NavBar 占位 56px */}
      <div className="h-14 w-full shrink-0" />
      <div className="flex w-full flex-col items-center pb-4 pl-4">
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
          className="!h-12 !rounded-xl !text-[14px] !font-medium"
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
  const listRef = useRef<ListHandle>(null);
  /** 从聊天记录定位回来时优先滚到目标，避免被「滚到底」覆盖 */
  const pendingScrollIndex = useRef<number | null>(null);
  const { ref: listWrapRef, height: listHeight } =
    useElementHeight<HTMLDivElement>();
  const isGroup = peer.kind === 'group';
  const title =
    isGroup && peer.memberCount
      ? `${peer.name} (${peer.memberCount})`
      : peer.name;

  useEffect(() => {
    if (historyOpen || loading || !messages.length || listHeight <= 0) return;
    const target =
      pendingScrollIndex.current != null
        ? pendingScrollIndex.current
        : messages.length - 1;
    pendingScrollIndex.current = null;
    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView(target);
    });
  }, [historyOpen, loading, messages.length, listHeight, peer.id]);

  if (historyOpen) {
    return (
      <ChatHistoryPanel
        chatType={isGroup ? 'group' : 'user'}
        chatId={peer.id}
        onClose={() => setHistoryOpen(false)}
        onLocate={(messageId) => {
          const idx = messages.findIndex((m) => m.id === messageId);
          if (idx >= 0) {
            pendingScrollIndex.current = idx;
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
          <Avatar size={32}>{peer.name.slice(0, 1)}</Avatar>
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
        {!isGroup ? (
          <div className="flex shrink-0 items-center gap-4 text-[20px] text-arco-text-2">
            <IconPhone />
            <IconVideoCamera />
            <button
              type="button"
              aria-label="查看聊天记录"
              className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[20px] text-arco-text-2"
              onClick={() => setHistoryOpen(true)}
            >
              <IconSearch />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label="查看聊天记录"
            className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[18px] text-arco-text-2"
            onClick={() => setHistoryOpen(true)}
          >
            <IconSearch />
          </button>
        )}
      </header>

      <Alert
        type="warning"
        showIcon
        className="use-user-chat-alert shrink-0"
        content="只读模式：您正在以管理员权限查看用户通讯记录。系统仅保留最近 180 天的消息内容。所有查阅操作均已记录在审计日志中，请遵守隐私合规规范。"
      />

      <div ref={listWrapRef} className="min-h-0 flex-1 py-2">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spin />
          </div>
        ) : listHeight > 0 ? (
          <List
            className="use-chat-virtual-list"
            bordered={false}
            split={false}
            dataSource={messages}
            listRef={listRef}
            virtualListProps={{
              height: listHeight,
              // 气泡高度不一（文字/图/文件），关闭定高，交给 Arco 测量
              isStaticItemHeight: false,
              itemHeight: 72,
              // 少于 50 条走普通渲染，避免小列表虚拟化开销
              threshold: 50
            }}
            render={(item: ChatMsg) => (
              <MessageRow key={item.id} msg={item} />
            )}
          />
        ) : null}
      </div>
    </div>
  );
}

function MessageRow({ msg }: { msg: ChatMsg }) {
  if (msg.msgType === 'date') {
    return (
      <div className="flex justify-center px-4 py-2">
        <span className="rounded-full bg-[rgba(0,0,0,0.45)] px-3 py-0.5 text-[12px] text-white">
          {msg.dateLabel || msg.content}
        </span>
      </div>
    );
  }

  if (msg.msgType === 'system') {
    return (
      <div className="px-10 py-2 text-center text-[12px] leading-4 text-arco-text-3">
        {msg.content}
      </div>
    );
  }

  const isSelf = msg.side === 'self';

  return (
    <div
      className={`flex gap-2 px-4 py-1 ${
        isSelf ? 'justify-end' : 'items-end justify-start'
      }`}
    >
      {!isSelf ? (
        <Avatar size={24} className="shrink-0">
          {(msg.senderName || '?').slice(0, 1)}
        </Avatar>
      ) : null}
      <div
        className={`flex max-w-[70%] flex-col gap-1 ${
          isSelf ? 'items-end' : 'items-start'
        }`}
      >
        {!isSelf && msg.senderName ? (
          <span className="text-[12px] text-arco-text-3">{msg.senderName}</span>
        ) : null}
        <Bubble msg={msg} isSelf={isSelf} />
        {msg.time ? (
          <span className="text-[11px] text-arco-text-3">{msg.time}</span>
        ) : null}
      </div>
    </div>
  );
}

function Bubble({ msg, isSelf }: { msg: ChatMsg; isSelf: boolean }) {
  const base = isSelf
    ? 'rounded-xl bg-[rgb(var(--primary-6))] px-2 py-1.5 text-[14px] text-white'
    : 'rounded-xl border border-solid border-[rgba(120,120,128,0.12)] bg-white px-2 py-1.5 text-[14px] text-arco-text-1';

  if (msg.msgType === 'image') {
    return (
      <div className="flex size-[180px] items-center justify-center overflow-hidden rounded-xl bg-[var(--color-fill-2,#eee)] text-center text-[12px] leading-[1.4] text-arco-text-3">
        图片
        <br />
        最大宽 180px
      </div>
    );
  }

  if (msg.msgType === 'video') {
    return (
      <div className="relative flex size-[180px] items-center justify-center overflow-hidden rounded-xl bg-[rgba(0,0,0,0.45)] text-center text-[12px] leading-[1.4] text-white">
        <IconPlayArrowFill className="absolute text-[40px] text-white/90" />
        <span className="mt-16">视频</span>
      </div>
    );
  }

  if (msg.msgType === 'voice') {
    return (
      <div className={`inline-flex items-center gap-2 ${base}`}>
        <IconSound />
        <span>{msg.duration || msg.content || "1\""}</span>
      </div>
    );
  }

  if (msg.msgType === 'file') {
    return (
      <div className={`inline-flex min-w-[140px] items-center gap-2 ${base}`}>
        <IconFile className="text-[20px]" />
        <div className="min-w-0">
          <div className="truncate">{msg.fileName || msg.content}</div>
          <div
            className={`text-[12px] ${
              isSelf ? 'text-white/50' : 'text-arco-text-3'
            }`}
          >
            {msg.fileSize || ''}
          </div>
        </div>
      </div>
    );
  }

  if (msg.msgType === 'call') {
    return (
      <div className={`inline-flex items-center gap-2 ${base}`}>
        {msg.content?.includes('视频') ? <IconVideoCamera /> : <IconPhone />}
        <span>{msg.content}</span>
        {msg.callStatus ? (
          <span className={isSelf ? 'text-white/60' : 'text-arco-text-3'}>
            {msg.callStatus}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`whitespace-pre-wrap break-words ${base}`}>{msg.content}</div>
  );
}
