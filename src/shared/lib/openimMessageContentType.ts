/**
 * OpenIM MessageContentType
 * @see https://docs.openim.io/sdks/enum/messageContentType
 */

/** 与 OpenIM SDK MessageType 数值对齐 */
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

/** 聊天 UI 气泡类型（由 OpenIM contentType 映射） */
export type OpenIMChatUiMsgType =
  | 'text'
  | 'image'
  | 'voice'
  | 'video'
  | 'file'
  | 'system';

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
  // 好友 / 会话 / 群通知段
  return type >= 1200 && type < 2200 && !isHiddenMessageContentType(type);
}

/** OpenIM contentType → 查聊天气泡类型 */
export function mapMessageContentTypeToUi(
  type?: number
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
    default:
      return 'text';
  }
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
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDurationSeconds(sec?: number): string | undefined {
  if (sec == null || sec < 0) return undefined;
  const n = Math.round(sec);
  return `${n}"`;
}

/**
 * 从 OpenIM 消息 body 解析展示字段（兼容 camelCase / snake_case / 扁平字段）。
 */
export function parseOpenIMMessageBody(
  type: number | undefined,
  body: Record<string, any> = {}
): {
  content?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  mediaUrl?: string;
} {
  const nested = (key: string) =>
    body[key] && typeof body[key] === 'object' ? body[key] : undefined;

  const textElem = nested('textElem') || nested('text_elem');
  const pictureElem = nested('pictureElem') || nested('picture_elem');
  const soundElem = nested('soundElem') || nested('sound_elem');
  const videoElem = nested('videoElem') || nested('video_elem');
  const fileElem = nested('fileElem') || nested('file_elem');
  const atTextElem = nested('atTextElem') || nested('at_text_elem');
  const cardElem = nested('cardElem') || nested('card_elem');
  const locationElem = nested('locationElem') || nested('location_elem');
  const quoteElem = nested('quoteElem') || nested('quote_elem');
  const mergeElem = nested('mergeElem') || nested('merge_elem');
  const faceElem = nested('faceElem') || nested('face_elem');
  const customElem = nested('customElem') || nested('custom_elem');
  const notificationElem =
    nested('notificationElem') || nested('notification_elem');

  switch (type) {
    case MessageContentType.Text:
    case MessageContentType.AdvancedText:
    case MessageContentType.Markdown:
      return {
        content: pickStr(
          textElem?.content,
          body.content,
          body.text,
          body.markdown
        )
      };

    case MessageContentType.AtText:
      return {
        content: pickStr(atTextElem?.text, body.text, body.content)
      };

    case MessageContentType.Quote:
      return {
        content: pickStr(quoteElem?.text, body.text, body.content)
      };

    case MessageContentType.Picture: {
      const source =
        pictureElem?.sourcePicture ||
        pictureElem?.source_picture ||
        pictureElem?.bigPicture ||
        pictureElem?.big_picture;
      return {
        content: '',
        mediaUrl: pickStr(
          source?.url,
          pictureElem?.sourcePath,
          pictureElem?.source_path,
          body.url,
          body.image_url,
          body.source_url
        )
      };
    }

    case MessageContentType.Voice: {
      const sec = pickNum(
        soundElem?.duration,
        body.duration,
        body.sound_duration
      );
      return {
        content: formatDurationSeconds(sec) || '',
        duration: formatDurationSeconds(sec),
        mediaUrl: pickStr(
          soundElem?.sourceUrl,
          soundElem?.source_url,
          body.url,
          body.source_url
        )
      };
    }

    case MessageContentType.Video: {
      const sec = pickNum(videoElem?.duration, body.duration);
      return {
        content: '',
        duration: formatDurationSeconds(sec),
        mediaUrl: pickStr(
          videoElem?.videoUrl,
          videoElem?.video_url,
          body.url,
          body.video_url
        )
      };
    }

    case MessageContentType.File: {
      const name = pickStr(
        fileElem?.fileName,
        fileElem?.file_name,
        body.file_name,
        body.fileName,
        body.name
      );
      const size = pickNum(
        fileElem?.fileSize,
        fileElem?.file_size,
        body.file_size,
        body.fileSize
      );
      return {
        content: name || '',
        fileName: name,
        fileSize: formatFileSize(size),
        mediaUrl: pickStr(
          fileElem?.sourceUrl,
          fileElem?.source_url,
          body.url,
          body.source_url
        )
      };
    }

    case MessageContentType.Card:
      return {
        content: pickStr(
          cardElem?.nickname,
          body.nickname,
          body.user_id,
          body.userID,
          '[名片]'
        )
      };

    case MessageContentType.Location:
      return {
        content: pickStr(
          locationElem?.description,
          body.description,
          body.desc,
          '[位置]'
        )
      };

    case MessageContentType.Merger:
      return {
        content: pickStr(mergeElem?.title, body.title, '[合并消息]')
      };

    case MessageContentType.CustomFace:
      return {
        content: pickStr(faceElem?.data, body.data, '[表情]')
      };

    case MessageContentType.Custom:
      return {
        content: pickStr(
          customElem?.description,
          customElem?.data,
          body.description,
          body.data,
          '[自定义消息]'
        )
      };

    case MessageContentType.RevokeMessageNotification:
      return { content: pickStr(body.detail, body.content, '消息已撤回') };

    default:
      if (isNotificationMessageContentType(type)) {
        return {
          content: pickStr(
            notificationElem?.detail,
            notificationElem?.defaultTips,
            notificationElem?.default_tips,
            body.detail,
            body.content,
            body.defaultTips,
            body.default_tips
          )
        };
      }
      return {
        content: pickStr(body.text, body.content)
      };
  }
}
