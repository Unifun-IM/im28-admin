import request from '@shared/api/request';

export type PageParams = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  keywordType?: string;
  status?: string;
  [key: string]: unknown;
};

export type PageResult<T> = {
  list: T[];
  total: number;
  summary?: Record<string, number | string>;
};

export async function getUserList(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/user/list', {
    params
  });
}

export async function getUserDetail(id: string) {
  return request.get<Record<string, unknown>>(`/api/biz/user/detail/${id}`);
}

export async function getUserLogs(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/user/logs', {
    params
  });
}

export async function getBlacklist(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/user/blacklist', {
    params
  });
}

export async function getWhitelist(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/user/whitelist', {
    params
  });
}

export async function getInviteCodes(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/user/invite-codes', {
    params
  });
}

export type UserHierarchyNode = {
  key: string;
  userId: string;
  nickname: string;
  avatar?: string;
  inviteCode: string;
  /** 直属下级数量 */
  childCount: number;
  /** parent=上级；target=查询目标；child=下级 */
  role?: 'parent' | 'target' | 'child';
  children?: UserHierarchyNode[];
};

export async function getUserHierarchy(userId: string) {
  return request.get<{ tree: UserHierarchyNode | null }>(
    '/api/biz/user/hierarchy',
    { params: { userId } }
  );
}

export async function postBlacklistAction(body: {
  ids: string[];
  action: 'add' | 'remove';
  /** 批量加入：限时 / 永久 */
  durationType?: 'temporary' | 'permanent';
  reason?: string;
  reasonDetail?: string;
  remark?: string;
}) {
  return request.post('/api/biz/user/blacklist/action', body);
}

export async function postWhitelistAction(body: {
  ids: string[];
  action: 'add' | 'remove';
  keyword?: string;
  whitelistType?: string;
  reason?: string;
  reasonDetail?: string;
  remark?: string;
}) {
  return request.post('/api/biz/user/whitelist/action', body);
}

export async function getAccounts(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/system/accounts', {
    params
  });
}

export async function getRoles(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/system/roles', {
    params
  });
}

export async function getOpLogs(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/system/op-logs', {
    params
  });
}

export async function getSystemParams() {
  return request.get<Record<string, unknown>>('/api/biz/system-params');
}

export async function saveSystemParams(body: Record<string, unknown>) {
  return request.post('/api/biz/system-params', body);
}

export async function getRechargeOrders(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>(
    '/api/biz/finance/recharge-orders',
    { params }
  );
}

export async function getRechargeAbnormal(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>(
    '/api/biz/finance/recharge-abnormal',
    { params }
  );
}

export async function getRechargeChannels(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>(
    '/api/biz/finance/recharge-channels',
    { params }
  );
}

export async function getWithdrawAudit(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>(
    '/api/biz/finance/withdraw-audit',
    { params }
  );
}

export async function getWithdrawAbnormal(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>(
    '/api/biz/finance/withdraw-abnormal',
    { params }
  );
}

export async function getWithdrawChannels(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>(
    '/api/biz/finance/withdraw-channels',
    { params }
  );
}

export async function getRedpacketRecords(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>(
    '/api/biz/trade/redpacket-records',
    { params }
  );
}

export async function getRedpacketDetail(id: string) {
  return request.get<Record<string, unknown>>(`/api/biz/trade/redpacket-detail/${id}`);
}

export async function getRedpacketConfig() {
  return request.get<Record<string, unknown>>('/api/biz/trade/redpacket-config');
}

export async function saveRedpacketConfig(body: Record<string, unknown>) {
  return request.post('/api/biz/trade/redpacket-config', body);
}

export async function getUserSessions(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/session/user', {
    params
  });
}

export async function getGroupSessions(params: PageParams) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/session/group', {
    params
  });
}

export async function getGroupDetail(id: string) {
  return request.get<Record<string, unknown>>(`/api/biz/session/group-detail/${id}`);
}

export async function getUserChatBook(userId: string) {
  return request.get<Record<string, unknown>>(`/api/biz/session/user-chat/${userId}`);
}

export async function getChatMessages(params: {
  type: string;
  id: string;
  page?: number;
  pageSize?: number;
}) {
  return request.get<PageResult<Record<string, unknown>>>('/api/biz/session/chat', {
    params
  });
}

export async function searchChatHistory(params: {
  type: string;
  id: string;
  keyword?: string;
  tab?: string;
  date?: string;
  mediaFilter?: string;
}) {
  return request.get<Record<string, unknown>>('/api/biz/session/chat-history', {
    params
  });
}
