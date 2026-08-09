/**
 * Admin / IM MessageContentType → 查聊天气泡
 * UI 样式对齐 Figma 1092:33280
 * 展示文案走 im.msg / im.event（见 locale/im.ts）
 * @see docs/消息类型说明.md
 * @see AdminAPI.MessageType
 */

import { imMsg, resolveImLocale } from '@shared/lib/imLabels';

/** 与 Admin MessageType 对齐；1203+ / 2101 等为 IM 历史兼容 */
export const MessageContentType = {
  Text: 101,
  Picture: 102,
  Voice: 103,
  Video: 104,
  File: 105,
  AtText: 106,
  Merger: 107,
  Card: 108,
  Location: 109,
  Custom: 110,
  /** iOS 历史：撤回回执 */
  RevokeReceipt: 111,
  /** iOS 历史：单聊已读回执 */
  C2CReceipt: 112,
  Typing: 113,
  Quote: 114,
  /** Admin：MESSAGE_TYPE_EMOJI */
  CustomFace: 115,
  AdvancedText: 117,
  Markdown: 118,
  CustomMsgNotTriggerConversation: 119,
  CustomMsgOnlineOnly: 120,

  /** 1200 好友申请（个人通知） */
  FriendApplicationNotice: 1200,
  FriendNotification: 1200,
  /** 1201 成为好友（单聊会话消息） */
  FriendCreatedNotice: 1201,
  FriendApplicationApprovedNotification: 1201,
  /** 1202 好友关系解除（个人通知）— 非「申请被拒」 */
  FriendDeletedNotice: 1202,
  /** IM 历史扩展 */
  FriendApplicationNotification: 1203,
  FriendAddedNotification: 1204,
  FriendDeletedNotification: 1205,
  FriendRemarkSetNotification: 1206,
  BlackAddedNotification: 1207,
  BlackDeletedNotification: 1208,

  ConversationChangeNotification: 1300,
  UserInfoUpdatedNotification: 1303,
  /** 1400 未分配独立类型的兜底系统事件 */
  OANotification: 1400,

  GroupCreatedNotification: 1501,
  GroupInfoSetNotification: 1502,
  JoinGroupApplicationNotification: 1503,
  MemberQuitNotification: 1504,
  GroupApplicationAcceptedNotification: 1505,
  GroupApplicationRejectedNotification: 1506,
  GroupOwnerTransferredNotification: 1507,
  MemberKickedNotification: 1508,
  MemberInvitedNotification: 1509,
  MemberEnterNotification: 1510,
  DismissGroupNotification: 1511,
  GroupMemberMutedNotification: 1512,
  GroupMemberCancelMutedNotification: 1513,
  GroupMutedNotification: 1514,
  GroupCancelMutedNotification: 1515,
  /** 1516 群发言频率配置变更（非成员资料变更） */
  GroupSendFrequencyChangedNotification: 1516,
  GroupMemberSetToAdminNotification: 1517,
  GroupMemberSetToOrdinaryUserNotification: 1518,
  GroupInfoSetAnnouncementNotification: 1519,
  GroupInfoSetNameNotification: 1520,
  /** 1521 群简介变更 */
  GroupDescriptionChangedNotification: 1521,

  /**
   * 通话过程通知（body.system.event_type = rtc.call.*）；不写聊天消息表
   * 最终通话记录用 110 + custom.key=rtc.call.summary
   */
  RtcCallInviteNotification: 1601,
  RtcCallAcceptNotification: 1602,
  RtcCallRejectNotification: 1603,
  RtcCallCancelNotification: 1604,
  RtcCallHangupNotification: 1605,
  RtcCallEndedNotification: 1606,
  /** 预留：未接通话 */
  RtcCallMissedNotification: 1607,
  /** 预留：通话失败 */
  RtcCallFailedNotification: 1608,

  BurnAfterReadingNotification: 1701,
  BusinessNotification: 2001,
  /** IM 历史撤回通知 */
  RevokeMessageNotification: 2101,
  /** Admin：会话历史清空 conversation_cleared（非撤回） */
  ConversationClearedNotification: 2102,
  SignalHasReadReceiptNotification: 2150,
  GroupHasReadReceiptNotification: 2155
} as const;

/** 通话历史自定义消息 key（type=110） */
export const RTC_CALL_SUMMARY_KEY = 'rtc.call.summary';

export type MessageContentTypeValue =
  (typeof MessageContentType)[keyof typeof MessageContentType];

/** 聊天 UI 气泡类型（Figma 1092:33280 消息样式枚举） */
export type ImChatUiMsgType =
  | 'text'
  | 'image'
  | 'voice'
  | 'video'
  | 'file'
  | 'call'
  | 'card'
  | 'location'
  | 'quote'
  | 'merger'
  | 'system';

export type ParsedChatMessageBody = {
  content?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
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
  callStatus?: string;
  callKind?: 'voice' | 'video';
  forwardFromName?: string;
  forwardFromAvatar?: string;
};

/** 不应展示为会话气泡的类型（输入中、已读回执、在线-only 等） */
export function isHiddenMessageContentType(type?: number): boolean {
  if (type == null) return false;
  return (
    type === MessageContentType.Typing ||
    type === MessageContentType.RevokeReceipt ||
    type === MessageContentType.C2CReceipt ||
    type === MessageContentType.CustomMsgNotTriggerConversation ||
    type === MessageContentType.CustomMsgOnlineOnly ||
    type === MessageContentType.SignalHasReadReceiptNotification ||
    type === MessageContentType.GroupHasReadReceiptNotification
  );
}

/** 通知 / 系统类（含撤回、会话清空、1601-1608 通话过程通知） */
export function isNotificationMessageContentType(type?: number): boolean {
  if (type == null) return false;
  if (
    type === MessageContentType.RevokeMessageNotification ||
    type === MessageContentType.ConversationClearedNotification
  ) {
    return true;
  }
  if (type === MessageContentType.OANotification) return true;
  if (type === MessageContentType.BusinessNotification) return true;
  if (type === MessageContentType.BurnAfterReadingNotification) return true;
  return type >= 1200 && type < 2200 && !isHiddenMessageContentType(type);
}

/** Admin 用户内容消息（文档 §4.1）；未知类型走「暂不支持」兜底 */
const KNOWN_USER_CONTENT_TYPES = new Set<number>([
  MessageContentType.Text,
  MessageContentType.Picture,
  MessageContentType.Voice,
  MessageContentType.Video,
  MessageContentType.File,
  MessageContentType.AtText,
  MessageContentType.Merger,
  MessageContentType.Card,
  MessageContentType.Location,
  MessageContentType.Custom,
  MessageContentType.Quote,
  MessageContentType.CustomFace,
  MessageContentType.AdvancedText,
  MessageContentType.Markdown
]);

export function isKnownUserContentMessageType(type?: number): boolean {
  if (type == null) return false;
  return KNOWN_USER_CONTENT_TYPES.has(type);
}

export function isRtcCallProcessNotification(type?: number): boolean {
  if (type == null) return false;
  return (
    type >= MessageContentType.RtcCallInviteNotification &&
    type <= MessageContentType.RtcCallFailedNotification
  );
}

function pickStr(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v;
  }
  return undefined;
}

function pickNum(...vals: unknown[]): number | undefined {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return undefined;
}

function formatFileSize(bytes?: number): string | undefined {
  if (bytes == null || bytes < 0) return undefined;
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDurationSeconds(sec?: number): string | undefined {
  if (sec == null || sec < 0) return undefined;
  const n = Math.round(sec);
  return `${n}"`;
}

/** 解析消息时可选上下文 */
export type ParseMessageBodyOptions = {
  /** 当前会话所属用户（管理端「查聊天」视角） */
  viewerUserId?: string;
  /** user_id → 展示名（昵称/账号） */
  resolveUserName?: (userId: string) => string | undefined;
  /** im 文案包；不传则按 arco-lang 解析 */
  locale?: Record<string, string>;
};

function formatCallDuration(
  sec?: number,
  locale?: Record<string, string>
): string | undefined {
  if (sec == null || sec < 0) return undefined;
  const n = Math.round(sec);
  const mm = String(Math.floor(n / 60)).padStart(2, '0');
  const ss = String(n % 60).padStart(2, '0');
  return imMsg(locale, 'callDuration', `通话时长 ${mm}:${ss}`, { mm, ss });
}

function localeOf(opts?: ParseMessageBodyOptions) {
  return opts?.locale || resolveImLocale();
}

function nested(body: Record<string, any>, ...keys: string[]) {
  for (const key of keys) {
    if (body[key] && typeof body[key] === 'object') return body[key];
  }
  return undefined;
}

/**
 * 解析 type=110 custom 通话历史。
 * Admin 约定：key=rtc.call.summary，data 为 JSON（含 status_text / duration_seconds / call_type）。
 */
function parseCustomCall(
  custom?: Record<string, any>,
  opts?: ParseMessageBodyOptions
): ParsedChatMessageBody | null {
  if (!custom) return null;
  const t = localeOf(opts);
  let data: Record<string, any> = custom;
  const raw = pickStr(custom.data, custom.Data);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') data = parsed;
    } catch {
      /* ignore */
    }
  }
  const key = String(
    pickStr(custom.key, custom.Key, data.key, data.type, data.customType) || ''
  ).toLowerCase();
  const isSummary = key === RTC_CALL_SUMMARY_KEY || key === 'rtc.call.summary';
  const looksCall =
    isSummary ||
    /call|rtc|voip|音视频|通话/.test(key) ||
    data.duration != null ||
    data.duration_seconds != null ||
    data.callStatus != null ||
    data.status_text != null ||
    data.status === 'rejected' ||
    data.status === 'refuse';
  if (!looksCall) return null;

  const status = String(data.status || data.result || '').toLowerCase();
  const statusText = pickStr(data.status_text, data.statusText);
  const reason = pickStr(data.reason, data.reason_text);
  const rejected =
    data.rejected === true ||
    status === 'rejected' ||
    status === 'refuse' ||
    status === 'reject' ||
    /拒绝|reject|refuse/.test(`${status} ${statusText || ''}`);
  const cancelled =
    status === 'cancelled' ||
    status === 'canceled' ||
    status === 'cancel' ||
    /取消|cancel/.test(`${status} ${statusText || ''}`);

  const callType = String(
    pickStr(data.call_type, data.callType, data.mediaType, data.type) || ''
  ).toLowerCase();
  const isVideo =
    callType === 'video' ||
    callType === '2' ||
    /video|视频/.test(`${key} ${callType}`);

  const sec = pickNum(data.duration_seconds, data.duration, data.callDuration);
  const durationLabel =
    sec != null && sec > 0 ? formatCallDuration(sec, t) : undefined;
  const rejectedLabel = imMsg(t, 'callRejected', '已拒绝');
  const cancelledLabel = imMsg(t, 'callCancelled', '已取消');
  const callLabel = imMsg(t, 'call', '通话');

  let content: string;
  if (rejected) {
    content = statusText || rejectedLabel;
  } else if (cancelled) {
    content = statusText || cancelledLabel;
  } else if (durationLabel) {
    content = durationLabel;
  } else {
    content = statusText || reason || callLabel;
  }

  return {
    content,
    callStatus: rejected
      ? statusText || rejectedLabel
      : cancelled
        ? statusText || cancelledLabel
        : statusText,
    callKind: isVideo ? 'video' : 'voice',
    duration: durationLabel
  };
}

/**
 * Admin 约定使用 body.system 的 MessageType（与 OpenAPI MessageType 注释一致）。
 * 1200-1202、1400、已定义的 1501-1521、1601-1608、1701、2102 → SystemMessageBody
 */
export function isAdminSystemMessageType(type?: number): boolean {
  if (type == null) return false;
  if (type === 1200 || type === 1201 || type === 1202) return true;
  if (type === MessageContentType.OANotification) return true;
  if (type === MessageContentType.BurnAfterReadingNotification) return true;
  if (type === MessageContentType.ConversationClearedNotification) return true;
  if (isRtcCallProcessNotification(type)) return true;
  // 群相关系统通知（Admin MessageType 子集 + 兼容 IM 扩展码）
  if (type >= 1501 && type <= 1521) return true;
  return false;
}

/** rtc.call.* → 可读文案；call_type 区分音视频 */
function formatRtcCallSystemText(
  eventType: string,
  extra: Record<string, any>,
  opts?: ParseMessageBodyOptions
): string {
  const t = localeOf(opts);
  const callType = String(
    pickStr(extra.call_type, extra.callType) || ''
  ).toLowerCase();
  const isVideo = callType === 'video' || callType === '2';
  const kind = isVideo
    ? imMsg(t, 'videoCall', '视频通话')
    : imMsg(t, 'voiceCall', '语音通话');
  const map: Record<string, string> = {
    'rtc.call.invite': 'rtcInvite',
    'rtc.call.accept': 'rtcAccept',
    'rtc.call.reject': 'rtcReject',
    'rtc.call.cancel': 'rtcCancel',
    'rtc.call.hangup': 'rtcHangup',
    'rtc.call.ended': 'rtcEnded',
    'rtc.call.missed': 'rtcMissed',
    'rtc.call.failed': 'rtcFailed'
  };
  const msgKey = map[eventType];
  if (!msgKey) return eventType;
  return imMsg(t, msgKey, eventType, { kind });
}

/** 群系统 event_type → 可读文案（system.text 为空时） */
function formatGroupSystemText(
  eventType: string,
  extra: Record<string, any>,
  opts?: ParseMessageBodyOptions
): string | undefined {
  const t = localeOf(opts);
  const key = eventType.trim().toLowerCase().replace(/\./g, '_');
  const operator = pickStr(
    extra.operator_nickname,
    extra.operatorNickname,
    extra.operator_user_id,
    extra.operatorUserId
  );
  if (key === 'group_info_changed' && operator) {
    return imMsg(t, 'group_info_changed_by', '{name}修改了群信息', {
      name: operator
    });
  }
  const fallbacks: Record<string, string> = {
    group_created: '群聊已创建',
    group_info_changed: '群信息已变更',
    group_admin_permission_updated: '群管理员权限已更新',
    group_admin_set: '已设置群管理员',
    group_admin_cancel: '已取消群管理员',
    group_application_created: '发来一条入群申请',
    group_member_left: '成员已退群',
    group_owner_changed: '群主已变更',
    group_member_kicked: '成员已被移出群聊',
    group_member_invited: '已邀请成员入群',
    group_member_joined: '成员已加入群聊',
    group_member_enter: '成员已加入群聊',
    group_dismissed: '群聊已解散',
    group_member_muted: '成员已被禁言',
    group_member_unmuted: '成员禁言已解除',
    group_muted: '已开启全员禁言',
    group_unmuted: '已关闭全员禁言',
    group_send_frequency_changed: '群发言频率已变更',
    group_announcement_changed: '群公告已更新',
    group_name_changed: '群名称已变更',
    group_description_changed: '群简介已变更'
  };
  const fb = fallbacks[key];
  return fb ? imMsg(t, key, fb) : undefined;
}

/**
 * 从好友申请附言里猜自称名（非协议字段，仅兜底）。
 * 例：「我是debian，请通过好友验证」→「debian」
 */
function guessNameFromApplicationMsg(msg?: string): string | undefined {
  const s = String(msg || '').trim();
  if (!s) return undefined;
  const m =
    s.match(/^我是\s*([^，,。！!？?\s]{1,32})/) ||
    s.match(/^我叫\s*([^，,。！!？?\s]{1,32})/);
  const name = m?.[1]?.trim();
  if (!name || name.length > 20) return undefined;
  return name;
}

/**
 * 好友相关 system.event_type → 可读文案。
 * 名称：nickname → 解析 application_msg（我是/我叫）→ user_id / peer
 */
function formatFriendSystemText(
  eventType: string,
  extra: Record<string, any>,
  opts?: ParseMessageBodyOptions
): string | undefined {
  const t = localeOf(opts);
  const key = eventType.trim().toLowerCase().replace(/\./g, '_');
  switch (key) {
    case 'friend_created':
    case 'friend_added':
    case 'friend_application_approved': {
      const fromId = pickStr(extra.from_user_id, extra.fromUserId);
      const toId = pickStr(extra.to_user_id, extra.toUserId);
      let peerId = toId || fromId;
      const viewer = opts?.viewerUserId;
      if (viewer && toId && viewer === toId) peerId = fromId;
      else if (viewer && fromId && viewer === fromId) peerId = toId;

      const applicationMsg = pickStr(
        extra.application_msg,
        extra.applicationMsg,
        extra.req_msg,
        extra.reqMsg
      );

      const nickname =
        (peerId && opts?.resolveUserName?.(peerId)) ||
        pickStr(
          extra.peer_nickname,
          extra.peerNickname,
          extra.from_user_nickname,
          extra.to_user_nickname,
          extra.nickname
        );

      const name =
        nickname ||
        guessNameFromApplicationMsg(applicationMsg) ||
        peerId ||
        imMsg(t, 'peer', '对方');

      return applicationMsg
        ? imMsg(
            t,
            'friendCreatedGreeting',
            '你已添加了{name}通过了你的朋友验证请求，以上是打招呼的消息。',
            { name }
          )
        : imMsg(
            t,
            'friendCreated',
            '你已添加了{name}通过了你的朋友验证请求。',
            { name }
          );
    }
    case 'friend_deleted':
    case 'friend_removed':
    case 'friend_application':
    case 'friend_application_created':
    case 'friend_application_rejected':
    case 'friend_remark_set':
      return imMsg(t, key, key);
    default:
      return undefined;
  }
}

/** event_type → 展示文案；未识别时返回 undefined，由上层继续兜底 */
function formatSystemEventText(
  eventType: string,
  extra: Record<string, any>,
  opts?: ParseMessageBodyOptions
): string | undefined {
  const t = localeOf(opts);
  if (eventType.startsWith('rtc.call.')) {
    return formatRtcCallSystemText(eventType, extra, opts);
  }
  if (
    eventType.startsWith('friend') ||
    eventType.includes('friend_') ||
    eventType.includes('friend.')
  ) {
    return formatFriendSystemText(eventType, extra, opts);
  }
  if (
    eventType.startsWith('group') ||
    eventType.includes('group_') ||
    eventType.includes('group.')
  ) {
    return formatGroupSystemText(eventType, extra, opts);
  }
  const normalized = eventType.replace(/\./g, '_');
  if (normalized === 'conversation_cleared') {
    return imMsg(t, 'conversation_cleared', '聊天记录已清空');
  }
  if (normalized === 'auto_delete_changed') {
    return imMsg(t, 'auto_delete_changed', '自动删除配置已变更');
  }
  return undefined;
}

/** MessageType → event key，用于无 text/event 时的默认文案 */
const TYPE_EVENT_KEY: Partial<Record<number, string>> = {
  [MessageContentType.FriendApplicationNotice]: 'friend_application_created',
  [MessageContentType.FriendApplicationNotification]:
    'friend_application_created',
  [MessageContentType.FriendDeletedNotice]: 'friend_deleted',
  [MessageContentType.FriendDeletedNotification]: 'friend_deleted',
  [MessageContentType.RevokeMessageNotification]: 'message_revoked',
  [MessageContentType.ConversationClearedNotification]: 'conversation_cleared',
  [MessageContentType.BurnAfterReadingNotification]: 'burn_after_reading',
  [MessageContentType.OANotification]: 'system_notice',
  [MessageContentType.GroupCreatedNotification]: 'group_created',
  [MessageContentType.GroupInfoSetNotification]: 'group_info_changed',
  [MessageContentType.JoinGroupApplicationNotification]:
    'group_application_created',
  [MessageContentType.MemberQuitNotification]: 'group_member_left',
  [MessageContentType.GroupOwnerTransferredNotification]: 'group_owner_changed',
  [MessageContentType.MemberKickedNotification]: 'group_member_kicked',
  [MessageContentType.MemberInvitedNotification]: 'group_member_invited',
  [MessageContentType.MemberEnterNotification]: 'group_member_joined',
  [MessageContentType.DismissGroupNotification]: 'group_dismissed',
  [MessageContentType.GroupMemberMutedNotification]: 'group_member_muted',
  [MessageContentType.GroupMemberCancelMutedNotification]:
    'group_member_unmuted',
  [MessageContentType.GroupMutedNotification]: 'group_muted',
  [MessageContentType.GroupCancelMutedNotification]: 'group_unmuted',
  [MessageContentType.GroupSendFrequencyChangedNotification]:
    'group_send_frequency_changed',
  [MessageContentType.GroupInfoSetAnnouncementNotification]:
    'group_announcement_changed',
  [MessageContentType.GroupInfoSetNameNotification]: 'group_name_changed',
  [MessageContentType.GroupDescriptionChangedNotification]:
    'group_description_changed'
};

/** MessageType 无 text/event 映射时的默认文案 */
function defaultSystemTextByType(
  type?: number,
  opts?: ParseMessageBodyOptions
): string | undefined {
  if (type == null) return undefined;
  const t = localeOf(opts);
  if (
    type === MessageContentType.FriendCreatedNotice ||
    type === MessageContentType.FriendAddedNotification
  ) {
    return imMsg(
      t,
      'friendCreatedDefault',
      '你已添加了对方通过了你的朋友验证请求。'
    );
  }
  const eventKey = TYPE_EVENT_KEY[type];
  return eventKey ? imMsg(t, eventKey, eventKey) : undefined;
}

/**
 * 解析 Admin SystemMessageBody。
 * 结构：`{ system: { event_type?, text?, extra? } }`
 * - event_type / extra：结构化业务与展示优先
 * - text：兼容兜底，禁止用于业务判断
 * - extra.status_text / extra.reason：中文展示文案
 * - extra.status / extra.reason_code：稳定协议码，不作主展示
 * @see AdminAPI.SystemMessage / SystemMessageBody
 */
function parseSystemMessageBody(
  system?: Record<string, any> | null,
  body: Record<string, any> = {},
  type?: number,
  opts?: ParseMessageBodyOptions
): ParsedChatMessageBody {
  // 1) body.system  2) 传入的 system  3) body 本身像 SystemMessage
  const sys: Record<string, any> =
    system && typeof system === 'object' && !Array.isArray(system)
      ? system
      : body.system && typeof body.system === 'object'
        ? body.system
        : pickStr(body.event_type, body.text)
          ? body
          : {};

  const extra =
    sys.extra && typeof sys.extra === 'object' && !Array.isArray(sys.extra)
      ? sys.extra
      : {};

  const eventType = pickStr(sys.event_type, sys.eventType);
  /** 兼容兜底文本，禁止用于业务分支 */
  const fallbackText = pickStr(sys.text);
  const statusText = pickStr(extra.status_text, extra.statusText);
  const reason = pickStr(extra.reason);

  let content = '';

  // 好友通过类：用 event_type / type + extra 拼完整文案
  const friendEventKey = eventType
    ? eventType.trim().toLowerCase().replace(/\./g, '_')
    : '';
  const isFriendCreatedEvent =
    friendEventKey === 'friend_created' ||
    friendEventKey === 'friend_added' ||
    friendEventKey === 'friend_application_approved' ||
    type === MessageContentType.FriendCreatedNotice ||
    type === MessageContentType.FriendAddedNotification;

  if (isFriendCreatedEvent) {
    content =
      formatFriendSystemText(
        eventType || 'friend_created',
        extra,
        opts
      ) || '';
  } else if (eventType) {
    content = formatSystemEventText(eventType, extra, opts) || '';
  }

  if (!content) {
    content = pickStr(statusText, reason);
  }

  // text 仅兜底展示
  if (!content) {
    content = fallbackText;
  }

  if (!content) {
    content = defaultSystemTextByType(type, opts);
  }

  // IM 历史 notificationElem 兼容
  if (!content) {
    content = pickStr(
      sys.detail,
      sys.defaultTips,
      sys.default_tips,
      body.detail,
      body.content,
      body.defaultTips,
      body.default_tips
    );
  }

  // 仍无文案时不要露出裸 event_type（如 friend_created），用类型默认或通用提示
  if (!content && eventType) {
    content =
      defaultSystemTextByType(type, opts) ||
      imMsg(localeOf(opts), 'system', '系统消息');
  }

  return { content: content || undefined };
}

function parseForwardOrigin(
  body: Record<string, any>
): Pick<ParsedChatMessageBody, 'forwardFromName' | 'forwardFromAvatar'> {
  const origin =
    nested(body, 'forward_origin', 'forwardOrigin') || body.forward_origin;
  if (!origin || typeof origin !== 'object') return {};
  return {
    forwardFromName: pickStr(origin.name, origin.nickname, origin.user_id),
    forwardFromAvatar: pickStr(origin.avatar_url, origin.avatarUrl)
  };
}

/** IM contentType + body → 查聊天气泡类型 */
export function mapMessageContentTypeToUi(
  type?: number,
  body: Record<string, any> = {}
): ImChatUiMsgType {
  if (type == null) return 'text';
  if (isNotificationMessageContentType(type)) return 'system';
  switch (type) {
    case MessageContentType.Picture:
      return 'image';
    case MessageContentType.Voice:
      return 'voice';
    case MessageContentType.Video:
      return 'video';
    case MessageContentType.File:
      return 'file';
    case MessageContentType.Card:
      return 'card';
    case MessageContentType.Location:
      return 'location';
    case MessageContentType.Quote:
      return 'quote';
    case MessageContentType.Merger:
      return 'merger';
    case MessageContentType.CustomFace: {
      // 115：有 url 时按图片气泡展示表情贴纸
      const face =
        nested(body, 'emoji', 'faceElem', 'face_elem') || body.emoji || body;
      const url = pickStr(face?.url, body.url);
      return url ? 'image' : 'text';
    }
    case MessageContentType.Custom: {
      const call = parseCustomCall(
        nested(body, 'custom', 'customElem', 'custom_elem') || body
      );
      // map 阶段无 locale；仅判断是否通话气泡
      return call ? 'call' : 'text';
    }
    default:
      return 'text';
  }
}

/**
 * 从 Admin MessageBody / IM body 解析展示字段。
 * Admin 侧常见：text / image / audio / video / file / card / quote / location / merge / custom
 */
export function parseImMessageBody(
  type: number | undefined,
  body: Record<string, any> = {},
  opts?: ParseMessageBodyOptions
): ParsedChatMessageBody {
  const forward = parseForwardOrigin(body);
  const t = localeOf(opts);

  const textElem = nested(body, 'text', 'textElem', 'text_elem');
  const pictureElem = nested(body, 'image', 'pictureElem', 'picture_elem');
  const soundElem = nested(body, 'audio', 'soundElem', 'sound_elem');
  const videoElem = nested(body, 'video', 'videoElem', 'video_elem');
  const fileElem = nested(body, 'file', 'fileElem', 'file_elem');
  const atTextElem = nested(body, 'mention', 'atTextElem', 'at_text_elem');
  const cardElem = nested(body, 'card', 'cardElem', 'card_elem');
  const locationElem = nested(body, 'location', 'locationElem', 'location_elem');
  const quoteElem = nested(body, 'quote', 'quoteElem', 'quote_elem');
  const mergeElem = nested(body, 'merge', 'mergeElem', 'merge_elem');
  /** Admin：emoji；IM 兼容 faceElem */
  const faceElem = nested(body, 'emoji', 'faceElem', 'face_elem');
  const customElem = nested(body, 'custom', 'customElem', 'custom_elem');
  /** Admin 系统通知统一为 body.system */
  const systemElem = nested(body, 'system', 'notificationElem', 'notification_elem');

  switch (type) {
    case MessageContentType.Text:
    case MessageContentType.AdvancedText:
    case MessageContentType.Markdown:
      return {
        ...forward,
        content: pickStr(
          typeof textElem?.text === 'string' ? textElem.text : undefined,
          textElem?.content,
          body.content,
          body.text,
          body.markdown?.text,
          typeof body.markdown === 'string' ? body.markdown : undefined
        )
      };

    case MessageContentType.AtText:
      return {
        ...forward,
        content: pickStr(
          atTextElem?.text,
          typeof textElem?.text === 'string' ? textElem.text : undefined,
          body.text,
          body.content
        )
      };

    case MessageContentType.Quote: {
      // Admin QuoteMessage：{ msg_id, text, reply_text, sender_id }
      const quoteMsg =
        nested(quoteElem, 'quoteMessage', 'quote_message') || quoteElem;
      return {
        ...forward,
        content: pickStr(
          quoteElem?.reply_text,
          body.reply_text,
          body.content
        ),
        quoteSender: pickStr(
          quoteElem?.sender_id,
          quoteMsg?.sender_id,
          quoteElem?.nickname,
          body.quote_sender
        ),
        quoteText: pickStr(
          quoteElem?.text,
          quoteMsg?.text,
          quoteMsg?.content,
          quoteElem?.quote_text,
          body.quote_text
        )
      };
    }

    case MessageContentType.Picture: {
      const list = Array.isArray(pictureElem?.list) ? pictureElem.list : [];
      const first = list[0] || {};
      const source =
        pictureElem?.sourcePicture ||
        pictureElem?.source_picture ||
        pictureElem?.bigPicture ||
        pictureElem?.big_picture ||
        first;
      return {
        ...forward,
        content: '',
        mediaUrl: pickStr(
          source?.url,
          first?.url,
          pictureElem?.sourcePath,
          pictureElem?.source_path,
          body.url,
          body.image_url,
          body.source_url
        ),
        thumbnailUrl: pickStr(
          first?.thumbnail_url,
          source?.thumbnail_url,
          pictureElem?.snapshotPicture?.url
        )
      };
    }

    case MessageContentType.Voice: {
      const sec = pickNum(
        soundElem?.duration_seconds,
        soundElem?.duration,
        body.duration_seconds,
        body.duration,
        body.sound_duration
      );
      return {
        ...forward,
        content: formatDurationSeconds(sec) || '',
        duration: formatDurationSeconds(sec),
        mediaUrl: pickStr(
          soundElem?.url,
          soundElem?.sourceUrl,
          soundElem?.source_url,
          body.url,
          body.source_url
        )
      };
    }

    case MessageContentType.Video: {
      const sec = pickNum(
        videoElem?.duration_seconds,
        videoElem?.duration,
        body.duration_seconds,
        body.duration
      );
      return {
        ...forward,
        content: '',
        duration: formatDurationSeconds(sec),
        mediaUrl: pickStr(
          videoElem?.url,
          videoElem?.videoUrl,
          videoElem?.video_url,
          body.url,
          body.video_url
        ),
        thumbnailUrl: pickStr(
          videoElem?.thumbnail_url,
          videoElem?.snapshotUrl,
          videoElem?.snapshot_url
        )
      };
    }

    case MessageContentType.File: {
      const name = pickStr(
        fileElem?.name,
        fileElem?.fileName,
        fileElem?.file_name,
        body.file_name,
        body.fileName,
        body.name
      );
      const size = pickNum(
        fileElem?.size_bytes,
        fileElem?.fileSize,
        fileElem?.file_size,
        body.file_size,
        body.fileSize,
        body.size_bytes
      );
      return {
        ...forward,
        content: name || '',
        fileName: name,
        fileSize: formatFileSize(size),
        mediaUrl: pickStr(
          fileElem?.url,
          fileElem?.sourceUrl,
          fileElem?.source_url,
          body.url,
          body.source_url
        )
      };
    }

    case MessageContentType.Card: {
      const card = cardElem || body;
      const kind =
        card.type === 'group' || card.group
          ? 'group'
          : card.type === 'user' || card.user
            ? 'user'
            : card.group_id
              ? 'group'
              : 'user';
      const group = card.group || (kind === 'group' ? card : undefined);
      const user = card.user || (kind === 'user' ? card : undefined);
      if (kind === 'group') {
        return {
          ...forward,
          content: pickStr(
            group?.title,
            body.title,
            imMsg(t, 'groupCard', '[群名片]')
          ),
          cardKind: 'group',
          cardId: pickStr(group?.group_id, body.group_id),
          cardName: pickStr(group?.title, body.title),
          cardAvatar: pickStr(group?.avatar_url, body.avatar_url),
          cardDesc: pickStr(group?.description, body.description, body.desc),
          cardMemberCount: pickNum(group?.member_count, body.member_count)
        };
      }
      return {
        ...forward,
        content: pickStr(
          user?.nickname,
          body.nickname,
          imMsg(t, 'card', '[名片]')
        ),
        cardKind: 'user',
        cardId: pickStr(user?.user_id, body.user_id, body.userID),
        cardName: pickStr(user?.nickname, body.nickname),
        cardAvatar: pickStr(user?.avatar_url, body.avatar_url)
      };
    }

    case MessageContentType.Location:
      return {
        ...forward,
        content: pickStr(
          locationElem?.name,
          locationElem?.description,
          body.name,
          body.description,
          imMsg(t, 'location', '[位置]')
        ),
        locationName: pickStr(locationElem?.name, body.name),
        locationAddress: pickStr(
          locationElem?.address,
          locationElem?.description,
          body.address,
          body.description,
          body.desc
        )
      };

    case MessageContentType.Merger: {
      const abstracts = Array.isArray(mergeElem?.abstracts)
        ? mergeElem.abstracts.filter((x: unknown) => typeof x === 'string')
        : [];
      return {
        ...forward,
        content: pickStr(
          mergeElem?.title,
          body.title,
          imMsg(t, 'merge', '[合并消息]')
        ),
        quoteText: abstracts.slice(0, 3).join('\n') || undefined
      };
    }

    case MessageContentType.CustomFace: {
      const url = pickStr(faceElem?.url, body.url);
      return {
        ...forward,
        content: url
          ? ''
          : pickStr(
              faceElem?.emoji_id,
              faceElem?.data,
              body.data,
              imMsg(t, 'emoji', '[表情]')
            ),
        mediaUrl: url,
        thumbnailUrl: url
      };
    }

    case MessageContentType.Custom: {
      const call = parseCustomCall(customElem || body, opts);
      if (call) return { ...forward, ...call };
      return {
        ...forward,
        content: pickStr(
          customElem?.description,
          typeof customElem?.data === 'string' ? customElem.data : undefined,
          body.description,
          typeof body.data === 'string' ? body.data : undefined,
          imMsg(t, 'custom', '[自定义消息]')
        )
      };
    }

    case MessageContentType.RevokeMessageNotification:
    case MessageContentType.ConversationClearedNotification:
      return parseSystemMessageBody(systemElem, body, type, opts);

    default:
      // Admin：1200+/1400/15xx/16xx/1701/2102 等均走 body.system
      if (
        isAdminSystemMessageType(type) ||
        isNotificationMessageContentType(type)
      ) {
        return parseSystemMessageBody(systemElem, body, type, opts);
      }
      {
        const content = pickStr(
          typeof textElem?.text === 'string' ? textElem.text : undefined,
          body.markdown?.text,
          typeof body.text === 'string' ? body.text : undefined,
          body.content
        );
        // 未知用户内容类型：保留位置，展示兜底文案（文档 §1）
        if (
          !content &&
          type != null &&
          !isKnownUserContentMessageType(type) &&
          !isHiddenMessageContentType(type)
        ) {
          return {
            ...forward,
            content: imMsg(t, 'unsupported', '暂不支持的消息类型')
          };
        }
        return { ...forward, content };
      }
  }
}
