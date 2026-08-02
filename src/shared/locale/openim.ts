/**
 * OpenIM 对齐枚举文案
 * 文档：https://docs.openim.io/zh-Hans/sdks/enum/
 *
 * 注意：AdminAPI.AccountStatus（active/disabled）是后台拉黑业务态，
 * 不是 OpenIM account_check 的「未注册/已注册」，也不等于 LoginStatus。
 */
const i18n = {
  'en-US': {
    // Online — UserStatusInfo：0 offline / 1 online；Admin 额外提供 unknown
    'openim.online.online': 'Online',
    'openim.online.offline': 'Offline',
    'openim.online.unknown': 'Unknown',

    // GroupStatus — https://docs.openim.io/zh-Hans/sdks/enum/groupstatus
    'openim.groupStatus.0': 'Normal',
    'openim.groupStatus.1': 'Banned',
    'openim.groupStatus.2': 'Dissolved',
    'openim.groupStatus.3': 'Muted',

    // GroupType — https://docs.openim.io/zh-Hans/sdks/enum/grouptype （文档固定 2=工作大群；Admin 另有 1=普通群）
    'openim.groupType.1': 'Normal group',
    'openim.groupType.2': 'Work group',

    // RoleLevel — https://docs.openim.io/zh-Hans/sdks/enum/rolelevel
    'openim.roleLevel.100': 'Owner',
    'openim.roleLevel.60': 'Admin',
    'openim.roleLevel.20': 'Member',

    // GroupMemberFilter — https://docs.openim.io/zh-Hans/sdks/enum/groupmemberfilter
    'openim.groupMemberFilter.0': 'All members',
    'openim.groupMemberFilter.1': 'Owner',
    'openim.groupMemberFilter.2': 'Admins',
    'openim.groupMemberFilter.3': 'Members',
    'openim.groupMemberFilter.4': 'Admins and members',
    'openim.groupMemberFilter.5': 'Owner and admins',

    // ConversationType — https://docs.openim.io/zh-Hans/sdks/enum/conversationtype
    'openim.conversationType.1': 'Single chat',
    'openim.conversationType.3': 'Group chat',
    'openim.conversationType.4': 'Notification',

    // MessageStatus — https://docs.openim.io/zh-Hans/sdks/enum/messagestatus
    'openim.messageStatus.1': 'Sending',
    'openim.messageStatus.2': 'Sent',
    'openim.messageStatus.3': 'Failed',

    // MessageContentType — https://docs.openim.io/sdks/enum/messageContentType
    'openim.messageType.101': 'Text',
    'openim.messageType.102': 'Image',
    'openim.messageType.103': 'Voice',
    'openim.messageType.104': 'Video',
    'openim.messageType.105': 'File',
    'openim.messageType.106': 'Mention',
    'openim.messageType.107': 'Merge',
    'openim.messageType.108': 'Card',
    'openim.messageType.109': 'Location',
    'openim.messageType.110': 'Custom',
    'openim.messageType.113': 'Typing',
    'openim.messageType.114': 'Quote',
    'openim.messageType.115': 'Sticker',
    'openim.messageType.117': 'Advanced text',
    'openim.messageType.118': 'Markdown',
    'openim.messageType.1201': 'Friend added',
    'openim.messageType.1400': 'System notification',
    'openim.messageType.1501': 'Group created',
    'openim.messageType.1502': 'Group info updated',
    'openim.messageType.1504': 'Member quit',
    'openim.messageType.1507': 'Owner transferred',
    'openim.messageType.1508': 'Member kicked',
    'openim.messageType.1509': 'Member invited',
    'openim.messageType.1510': 'Member entered',
    'openim.messageType.1511': 'Group dismissed',
    'openim.messageType.1512': 'Member muted',
    'openim.messageType.1513': 'Member unmute',
    'openim.messageType.1514': 'Group muted',
    'openim.messageType.1515': 'Group unmute',
    'openim.messageType.1519': 'Announcement updated',
    'openim.messageType.1520': 'Group name updated',
    'openim.messageType.1701': 'Burn after reading',
    'openim.messageType.2101': 'Revoked',

    // HandleResult 语义对齐的好友申请态（Admin 为字符串枚举）
    'openim.friendApply.pending': 'Pending',
    'openim.friendApply.accepted': 'Accepted',
    'openim.friendApply.rejected': 'Rejected',
    'openim.friendApply.canceled': 'Canceled',
    'openim.friendApply.expired': 'Expired',

    // 性别（AdminAPI User.gender 注释；OpenIM 用户资料常见约定）
    'openim.gender.0': 'Unset',
    'openim.gender.1': 'Male',
    'openim.gender.2': 'Female',

    // 群成员状态（AdminAPI GroupUserPermission.state）
    'openim.memberState.active': 'Active',
    'openim.memberState.left': 'Left',
    'openim.memberState.removed': 'Removed',
    'openim.memberState.banned': 'Banned'
  },
  'zh-CN': {
    'openim.online.online': '在线',
    'openim.online.offline': '离线',
    'openim.online.unknown': '未知',

    'openim.groupStatus.0': '正常',
    'openim.groupStatus.1': '封禁',
    'openim.groupStatus.2': '已解散',
    'openim.groupStatus.3': '禁言',

    'openim.groupType.1': '普通群',
    'openim.groupType.2': '工作大群',

    'openim.roleLevel.100': '群主',
    'openim.roleLevel.60': '群管理员',
    'openim.roleLevel.20': '群普通成员',

    'openim.groupMemberFilter.0': '所有成员',
    'openim.groupMemberFilter.1': '群主',
    'openim.groupMemberFilter.2': '群管理员',
    'openim.groupMemberFilter.3': '群普通成员',
    'openim.groupMemberFilter.4': '群管理员和普通成员',
    'openim.groupMemberFilter.5': '群主和群管理员',

    'openim.conversationType.1': '单聊',
    'openim.conversationType.3': '群聊',
    'openim.conversationType.4': '通知',

    'openim.messageStatus.1': '发送中',
    'openim.messageStatus.2': '发送成功',
    'openim.messageStatus.3': '发送失败',

    'openim.messageType.101': '文本',
    'openim.messageType.102': '图片',
    'openim.messageType.103': '语音',
    'openim.messageType.104': '视频',
    'openim.messageType.105': '文件',
    'openim.messageType.106': '@消息',
    'openim.messageType.107': '合并消息',
    'openim.messageType.108': '名片',
    'openim.messageType.109': '位置',
    'openim.messageType.110': '自定义',
    'openim.messageType.113': '正在输入',
    'openim.messageType.114': '引用',
    'openim.messageType.115': '表情',
    'openim.messageType.117': '富文本',
    'openim.messageType.118': 'Markdown',
    'openim.messageType.1201': '已成为好友',
    'openim.messageType.1400': '系统通知',
    'openim.messageType.1501': '群创建',
    'openim.messageType.1502': '群信息变更',
    'openim.messageType.1504': '成员退群',
    'openim.messageType.1507': '群主转让',
    'openim.messageType.1508': '成员被踢',
    'openim.messageType.1509': '成员被邀请',
    'openim.messageType.1510': '成员入群',
    'openim.messageType.1511': '群解散',
    'openim.messageType.1512': '成员禁言',
    'openim.messageType.1513': '取消成员禁言',
    'openim.messageType.1514': '群禁言',
    'openim.messageType.1515': '取消群禁言',
    'openim.messageType.1519': '群公告变更',
    'openim.messageType.1520': '群名称变更',
    'openim.messageType.1701': '阅后即焚',
    'openim.messageType.2101': '撤回',

    'openim.friendApply.pending': '等待处理',
    'openim.friendApply.accepted': '已同意',
    'openim.friendApply.rejected': '已拒绝',
    'openim.friendApply.canceled': '已取消',
    'openim.friendApply.expired': '已过期',

    'openim.gender.0': '未设置',
    'openim.gender.1': '男',
    'openim.gender.2': '女',

    'openim.memberState.active': '在群',
    'openim.memberState.left': '已退群',
    'openim.memberState.removed': '已移除',
    'openim.memberState.banned': '已封禁'
  }
};

export default i18n;
