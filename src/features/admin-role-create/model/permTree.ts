/** 角色权限树 — 对齐 Figma 666:21515 */

export type PermAction = {
  key: string;
  title: string;
};

export type PermResource = {
  key: string;
  title: string;
  /** 资源本身是否作为可选叶子（无 actions 时） */
  leaf?: boolean;
  actions?: PermAction[];
};

export type PermModule = {
  key: string;
  title: string;
  /** 无子资源的模块（如登录后台） */
  leaf?: boolean;
  resources?: PermResource[];
};

export const ROLE_PERM_MODULES: PermModule[] = [
  {
    key: 'login',
    title: '登录后台',
    leaf: true
  },
  {
    key: 'user',
    title: '用户登录',
    resources: [
      {
        key: 'user.list',
        title: '用户列表',
        actions: [
          { key: 'user.list.detail', title: '详情' },
          { key: 'user.list.chat', title: '查看聊天记录' },
          { key: 'user.list.edit', title: '编辑' },
          { key: 'user.list.delete', title: '删除' },
          { key: 'user.list.export', title: '导出' }
        ]
      }
    ]
  },
  {
    key: 'message',
    title: '消息管理',
    resources: [
      { key: 'msg.private', title: '单聊消息', leaf: true },
      { key: 'msg.group', title: '群聊消息', leaf: true }
    ]
  },
  {
    key: 'system',
    title: '系统管理',
    resources: [
      {
        key: 'sys.accounts',
        title: '后台账号管理',
        actions: [
          { key: 'sys.accounts.add', title: '新增' },
          { key: 'sys.accounts.resetPwd', title: '重置密码' },
          { key: 'sys.accounts.resetGa', title: '重置GA密码' },
          { key: 'sys.accounts.roleAdjust', title: '角色调整' }
        ]
      },
      {
        key: 'sys.roles',
        title: '角色管理',
        actions: [
          { key: 'sys.roles.add', title: '新增' },
          { key: 'sys.roles.edit', title: '编辑' },
          { key: 'sys.roles.delete', title: '删除' },
          { key: 'sys.roles.toggle', title: '启用/禁用' }
        ]
      },
      { key: 'sys.params', title: '系统参数', leaf: true },
      { key: 'sys.logs', title: '操作日志', leaf: true }
    ]
  }
];

/** 收集模块下全部可选 key（含资源节点与 action） */
export function collectModuleKeys(mod: PermModule): string[] {
  if (mod.leaf) return [mod.key];
  const keys: string[] = [];
  (mod.resources || []).forEach((res) => {
    keys.push(res.key);
    (res.actions || []).forEach((a) => keys.push(a.key));
  });
  return keys;
}

export function collectAllPermKeys(): string[] {
  return ROLE_PERM_MODULES.flatMap(collectModuleKeys);
}
