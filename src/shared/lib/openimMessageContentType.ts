/**
 * OpenIM / Admin MessageContentType → 查聊天气泡
 * UI 样式对齐 Figma 1092:33280
 * @see https://docs.openim.io/sdks/enum/messageContentType
 */

/** 与 OpenIM SDK MessageType / Admin MessageType 数值对齐 */
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
  CustomFace: 115,
  AdvancedText: 117,
  /** 文档 Message Types：Markdown；部分平台同值语义不同 */
  Markdown: 118,
  CustomMsgNotTriggerConversation: 119,
  CustomMsgOnlineOnly: 120,

  /** Admin MessageType：好友相关系统通知起点 */
  FriendNotification: 1200,
  FriendApplicationApprovedNotification: 1201,
  FriendApplicationRejectedNotification: 1202,
  FriendApplicationNotification: 1203,
  FriendAddedNotification: 1204,
  FriendDeletedNotification: 1205,
  FriendRemarkSetNotification: 1206,
  BlackAddedNotification: 1207,
  BlackDeletedNotification: 1208,

  ConversationChangeNotification: 1300,
  UserInfoUpdatedNotification: 1303,
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
  GroupMemberInfoChangedNotification: 1516,
  GroupMemberSetToAdminNotification: 1517,
  GroupMemberSetToOrdinaryUserNotification: 1518,
  GroupInfoSetAnnouncementNotification: 1519,
  GroupInfoSetNameNotification: 1520,

  /**
   * Admin 通话过程系统通知（body.system.event_type = rtc.call.*）
   * @see AdminAPI.MessageType 1601-1608 / SystemMessage
   */
  RtcCallInviteNotification: 1601,
  RtcCallAcceptNotification: 1602,
  RtcCallRejectNotification: 1603,
  RtcCallCancelNotification: 1604,
  RtcCallHangupNotification: 1605,
  RtcCallEndedNotification: 1606,
  RtcCallNotification1607: 1607,
  RtcCallNotification1608: 1608,

  BurnAfterReadingNotification: 1701,
  BusinessNotification: 2001,
  /** OpenIM 历史撤回通知 */
  RevokeMessageNotification: 2101,
  /** Admin MessageType 撤回 / 系统删除类通知 */
  AdminRevokeMessageNotification: 2102,
  SignalHasReadReceiptNotification: 2150,
  GroupHasReadReceiptNotification: 2155
} as const;

/** 通话历史自定义消息 key（type=110） */
export const RTC_CALL_SUMMARY_KEY = 'rtc.call.summary';

export type MessageContentTypeValue =
  (typeof MessageContentType)[keyof typeof MessageContentType];

/** 聊天 UI 气泡类型（Figma 1092:33280 消息样式枚举） */
export type OpenIMChatUiMsgType =
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

/** 通知 / 系统类（含撤回、Admin 1601-1608 通话过程通知） */
export function isNotificationMessageContentType(type?: number): boolean {
  if (type == null) return false;
  if (
    type === MessageContentType.RevokeMessageNotification ||
    type === MessageContentType.AdminRevokeMessageNotification
  ) {
    return true;
  }
  if (type === MessageContentType.OANotification) return true;
  if (type === MessageContentType.BusinessNotification) return true;
  if (type === MessageContentType.BurnAfterReadingNotification) return true;
  return type >= 1200 && type < 2200 && !isHiddenMessageContentType(type);
}

export function isRtcCallProcessNotification(type?: number): boolean {
  if (type == null) return false;
  return (
    type >= MessageContentType.RtcCallInviteNotification &&
    type <= MessageContentType.RtcCallNotification1608
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

function formatCallDuration(sec?: number): string | undefined {
  if (sec == null || sec < 0) return undefined;
  const n = Math.round(sec);
  const mm = String(Math.floor(n / 60)).padStart(2, '0');
  const ss = String(n % 60).padStart(2, '0');
  return `通话时长 ${mm}:${ss}`;
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
  custom?: Record<string, any>
): ParsedChatMessageBody | null {
  if (!custom) return null;
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
  const durationLabel = sec != null && sec > 0 ? formatCallDuration(sec) : undefined;

  let content: string;
  if (rejected) {
    content = statusText || '已拒绝';
  } else if (cancelled) {
    content = statusText || '已取消';
  } else if (durationLabel) {
    content = durationLabel;
  } else {
    content = statusText || reason || '通话';
  }

  return {
    content,
    callStatus: rejected
      ? statusText || '已拒绝'
      : cancelled
        ? statusText || '已取消'
        : statusText,
    callKind: isVideo ? 'video' : 'voice',
    duration: durationLabel
  };
}

/**
 * Admin 约定使用 body.system 的 MessageType（与 OpenAPI MessageType 注释一致）。
 * 1200-1202、1400、已定义的 1501-1520、1601-1608、1701、2102 → SystemMessageBody
 */
export function isAdminSystemMessageType(type?: number): boolean {
  if (type == null) return false;
  if (type === 1200 || type === 1201 || type === 1202) return true;
  if (type === MessageContentType.OANotification) return true;
  if (type === MessageContentType.BurnAfterReadingNotification) return true;
  if (type === MessageContentType.AdminRevokeMessageNotification) return true;
  if (isRtcCallProcessNotification(type)) return true;
  // 群相关系统通知（Admin MessageType 子集 + 兼容 OpenIM 扩展码）
  if (type >= 1501 && type <= 1520) return true;
  return false;
}

/** rtc.call.* → 可读中文；call_type 区分音视频 */
function formatRtcCallSystemText(
  eventType: string,
  extra: Record<string, any>
): string {
  const callType = String(
    pickStr(extra.call_type, extra.callType) || ''
  ).toLowerCase();
  const isVideo = callType === 'video' || callType === '2';
  const kind = isVideo ? '视频通话' : '语音通话';
  switch (eventType) {
    case 'rtc.call.invite':
      return `发起${kind}`;
    case 'rtc.call.accept':
      return `已接听${kind}`;
    case 'rtc.call.reject':
      return `已拒绝${kind}`;
    case 'rtc.call.cancel':
      return `已取消${kind}`;
    case 'rtc.call.hangup':
      return `${kind}已挂断`;
    case 'rtc.call.ended':
      return `${kind}已结束`;
    default:
      return eventType;
  }
}

/** 解析消息时可选上下文（用于好友系统文案里填对方昵称） */
export type ParseMessageBodyOptions = {
  /** 当前会话所属用户（管理端「查聊天」视角） */
  viewerUserId?: string;
  /** user_id → 展示名（昵称/账号） */
  resolveUserName?: (userId: string) => string | undefined;
};

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
 * 好友相关 system.event_type → 可读中文。
 * friend_created 文案贴近客户端：
 * 「你已添加了{昵称}通过了你的朋友验证请求，以上是打招呼的消息。」
 * 名称：nickname → 解析 application_msg（我是/我叫）→ user_id / 对方
 */
function formatFriendSystemText(
  eventType: string,
  extra: Record<string, any>,
  opts?: ParseMessageBodyOptions
): string | undefined {
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

      // 无昵称时再从附言「我是XXX / 我叫XXX」兜底
      const name =
        nickname ||
        guessNameFromApplicationMsg(applicationMsg) ||
        peerId ||
        '对方';

      return applicationMsg
        ? `你已添加了${name}通过了你的朋友验证请求，以上是打招呼的消息。`
        : `你已添加了${name}通过了你的朋友验证请求。`;
    }
    case 'friend_deleted':
    case 'friend_removed':
      return '好友关系已解除';
    case 'friend_application':
    case 'friend_application_created':
      return '发来一条好友申请';
    case 'friend_application_rejected':
      return '好友申请已拒绝';
    case 'friend_remark_set':
      return '好友备注已更新';
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
  if (eventType.startsWith('rtc.call.')) {
    return formatRtcCallSystemText(eventType, extra);
  }
  if (
    eventType.startsWith('friend') ||
    eventType.includes('friend_') ||
    eventType.includes('friend.')
  ) {
    return formatFriendSystemText(eventType, extra, opts);
  }
  return undefined;
}

/** MessageType 无 text/event 映射时的默认文案 */
function defaultSystemTextByType(type?: number): string | undefined {
  if (type == null) return undefined;
  switch (type) {
    case MessageContentType.FriendNotification:
      return '好友通知';
    case MessageContentType.FriendApplicationApprovedNotification:
    case MessageContentType.FriendAddedNotification:
      return '你已添加了对方通过了你的朋友验证请求。';
    case MessageContentType.FriendApplicationRejectedNotification:
      return '好友申请已拒绝';
    case MessageContentType.FriendApplicationNotification:
      return '发来一条好友申请';
    case MessageContentType.FriendDeletedNotification:
      return '好友关系已解除';
    case MessageContentType.RevokeMessageNotification:
    case MessageContentType.AdminRevokeMessageNotification:
      return '消息已撤回';
    case MessageContentType.BurnAfterReadingNotification:
      return '阅后即焚消息';
    case MessageContentType.OANotification:
      return '系统通知';
    default:
      return undefined;
  }
}

/**
 * 解析 Admin SystemMessageBody。
 * 结构：`{ system: { event_type?, text?, extra? } }`
 * - text：给人阅读的主文案（优先）
 * - extra.status_text / extra.reason：中文展示文案
 * - extra.status / extra.reason_code：稳定协议码，不作主展示
 * - event_type：无文案时的兜底（friend_* / rtc.call.* 转中文）
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
  const text = pickStr(sys.text);
  const statusText = pickStr(extra.status_text, extra.statusText);
  const reason = pickStr(extra.reason);

  let content = pickStr(text, statusText, reason);

  // 好友通过类：即使后端给了简短 text，也优先用带昵称/打招呼提示的完整文案
  const friendEventKey = eventType
    ? eventType.trim().toLowerCase().replace(/\./g, '_')
    : '';
  const isFriendCreatedEvent =
    friendEventKey === 'friend_created' ||
    friendEventKey === 'friend_added' ||
    friendEventKey === 'friend_application_approved' ||
    type === MessageContentType.FriendApplicationApprovedNotification ||
    type === MessageContentType.FriendAddedNotification;

  if (isFriendCreatedEvent) {
    content =
      formatFriendSystemText(
        eventType || 'friend_created',
        extra,
        opts
      ) || content;
  } else if (!content && eventType) {
    content = formatSystemEventText(eventType, extra, opts);
  }

  if (!content) {
    content = defaultSystemTextByType(type);
  }

  // OpenIM 历史 notificationElem 兼容
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
    content = defaultSystemTextByType(type) || '系统消息';
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

/** OpenIM contentType + body → 查聊天气泡类型 */
export function mapMessageContentTypeToUi(
  type?: number,
  body: Record<string, any> = {}
): OpenIMChatUiMsgType {
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
    case MessageContentType.Custom: {
      const call = parseCustomCall(
        nested(body, 'custom', 'customElem', 'custom_elem') || body
      );
      return call ? 'call' : 'text';
    }
    default:
      return 'text';
  }
}

/**
 * 从 Admin MessageBody / OpenIM body 解析展示字段。
 * Admin 侧常见：text / image / audio / video / file / card / quote / location / merge / custom
 */
export function parseOpenIMMessageBody(
  type: number | undefined,
  body: Record<string, any> = {},
  opts?: ParseMessageBodyOptions
): ParsedChatMessageBody {
  const forward = parseForwardOrigin(body);

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
  /** Admin：emoji；OpenIM 兼容 faceElem */
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
          content: pickStr(group?.title, body.title, '[群名片]'),
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
        content: pickStr(user?.nickname, body.nickname, '[名片]'),
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
          '[位置]'
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
        content: pickStr(mergeElem?.title, body.title, '[合并消息]'),
        quoteText: abstracts.slice(0, 3).join('\n') || undefined
      };
    }

    case MessageContentType.CustomFace:
      return {
        ...forward,
        content: pickStr(
          faceElem?.emoji_id,
          faceElem?.data,
          faceElem?.url,
          body.data,
          '[表情]'
        ),
        mediaUrl: pickStr(faceElem?.url, body.url)
      };

    case MessageContentType.Custom: {
      const call = parseCustomCall(customElem || body);
      if (call) return { ...forward, ...call };
      return {
        ...forward,
        content: pickStr(
          customElem?.description,
          typeof customElem?.data === 'string' ? customElem.data : undefined,
          body.description,
          typeof body.data === 'string' ? body.data : undefined,
          '[自定义消息]'
        )
      };
    }

    case MessageContentType.RevokeMessageNotification:
    case MessageContentType.AdminRevokeMessageNotification:
      return parseSystemMessageBody(systemElem, body, type, opts);

    default:
      // Admin：1200+/1400/15xx/16xx/1701/2102 等均走 body.system
      if (
        isAdminSystemMessageType(type) ||
        isNotificationMessageContentType(type)
      ) {
        return parseSystemMessageBody(systemElem, body, type, opts);
      }
      return {
        ...forward,
        content: pickStr(
          typeof textElem?.text === 'string' ? textElem.text : undefined,
          body.markdown?.text,
          typeof body.text === 'string' ? body.text : undefined,
          body.content
        )
      };
  }
}
