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

  BurnAfterReadingNotification: 1701,
  BusinessNotification: 2001,
  RevokeMessageNotification: 2101,
  SignalHasReadReceiptNotification: 2150,
  GroupHasReadReceiptNotification: 2155
} as const;

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

/** 通知 / 系统类（含撤回） */
export function isNotificationMessageContentType(type?: number): boolean {
  if (type == null) return false;
  if (type === MessageContentType.RevokeMessageNotification) return true;
  if (type === MessageContentType.OANotification) return true;
  if (type === MessageContentType.BusinessNotification) return true;
  if (type === MessageContentType.BurnAfterReadingNotification) return true;
  return type >= 1200 && type < 2200 && !isHiddenMessageContentType(type);
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
  const looksCall =
    /call|rtc|voip|音视频|通话/.test(key) ||
    data.duration != null ||
    data.duration_seconds != null ||
    data.callStatus != null ||
    data.status === 'rejected' ||
    data.status === 'refuse';
  if (!looksCall) return null;

  const rejected =
    data.status === 'rejected' ||
    data.status === 'refuse' ||
    data.rejected === true ||
    /拒绝|reject|refuse/.test(String(data.status || data.result || ''));
  const isVideo =
    data.mediaType === 'video' ||
    data.type === 'video' ||
    data.callType === 'video' ||
    /video|视频/.test(key);

  const sec = pickNum(data.duration_seconds, data.duration, data.callDuration);
  return {
    content: rejected
      ? '已拒绝'
      : formatCallDuration(sec) || '通话',
    callStatus: rejected ? '已拒绝' : undefined,
    callKind: isVideo ? 'video' : 'voice',
    duration: sec != null ? formatCallDuration(sec) : undefined
  };
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
  body: Record<string, any> = {}
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
  const faceElem = nested(body, 'faceElem', 'face_elem', 'emoji');
  const customElem = nested(body, 'custom', 'customElem', 'custom_elem');
  const notificationElem =
    nested(body, 'notificationElem', 'notification_elem', 'system');

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
      const quoteMsg =
        nested(quoteElem, 'quoteMessage', 'quote_message') || quoteElem;
      return {
        ...forward,
        content: pickStr(
          quoteElem?.reply_text,
          quoteElem?.text,
          body.reply_text,
          body.text,
          body.content
        ),
        quoteSender: pickStr(
          quoteMsg?.sender_id,
          quoteElem?.sender_id,
          quoteElem?.nickname,
          body.quote_sender
        ),
        quoteText: pickStr(
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
        content: pickStr(faceElem?.data, faceElem?.url, body.data, '[表情]'),
        mediaUrl: pickStr(faceElem?.url, body.url)
      };

    case MessageContentType.Custom: {
      const call = parseCustomCall(customElem || body);
      if (call) return { ...forward, ...call };
      return {
        ...forward,
        content: pickStr(
          customElem?.description,
          customElem?.data,
          body.description,
          body.data,
          '[自定义消息]'
        )
      };
    }

    case MessageContentType.RevokeMessageNotification:
      return { content: pickStr(body.detail, body.content, '消息已撤回') };

    default:
      if (isNotificationMessageContentType(type)) {
        return {
          content: pickStr(
            notificationElem?.detail,
            notificationElem?.defaultTips,
            notificationElem?.default_tips,
            notificationElem?.text,
            body.detail,
            body.content,
            body.defaultTips,
            body.default_tips
          )
        };
      }
      return {
        ...forward,
        content: pickStr(
          typeof textElem?.text === 'string' ? textElem.text : undefined,
          body.text,
          body.content
        )
      };
  }
}
