/** 用户行为类型目录（用户日志） */
export type UserActionCategory = {
  category: string;
  actions: string[];
};

export const USER_ACTION_CATEGORIES: UserActionCategory[] = [
  {
    category: '账号与安全',
    actions: [
      '注册账号',
      '登录账号',
      '登录失败',
      '退出登录',
      '绑定手机号',
      '更换手机号',
      '绑定邮箱',
      '更换邮箱',
      '修改密码',
      '账号被封禁',
      '账号被解禁',
      '账号被冻结',
      '账号被注销'
    ]
  },
  {
    category: '个人资料',
    actions: ['修改头像', '修改昵称', '修改个人资料', '修改账号信息']
  },
  {
    category: '通知设置',
    actions: [
      '开启系统通知',
      '关闭系统通知',
      '开启私聊消息通知',
      '关闭私聊消息通知',
      '开启群聊消息通知',
      '关闭群聊消息通知',
      '开启“@我”通知',
      '关闭“@我”通知',
      '开启好友和群申请通知',
      '关闭好友和群申请通知',
      '开启语音视频通话通知',
      '关闭语音视频通话通知'
    ]
  }
];

/** 扁平：[action, category] */
export const USER_ACTION_PAIRS: [string, string][] =
  USER_ACTION_CATEGORIES.flatMap((group) =>
    group.actions.map((action): [string, string] => [action, group.category])
  );

export function findUserActionCategory(action: string): string | undefined {
  return USER_ACTION_PAIRS.find(([a]) => a === action)?.[1];
}
