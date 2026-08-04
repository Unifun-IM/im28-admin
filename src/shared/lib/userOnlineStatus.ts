/**
 * C 端用户在线状态 — 统一走 Presence 读模型
 * @see postV1AdminUsersOnlineStatusList（单次最多 30 个）
 */
import { postV1AdminUsersOnlineStatusList } from '@shared/api/admin/users';

const ONLINE_STATUS_CHUNK = 30;

/** 批量查询 user_id → online；失败时对应 id 不写入 map */
export async function fetchUserOnlineStatusMap(
  userIds: string[]
): Promise<Map<string, boolean>> {
  const ids = Array.from(
    new Set(userIds.map((id) => String(id || '').trim()).filter(Boolean))
  );
  const map = new Map<string, boolean>();
  if (!ids.length) return map;

  for (let i = 0; i < ids.length; i += ONLINE_STATUS_CHUNK) {
    const chunk = ids.slice(i, i + ONLINE_STATUS_CHUNK);
    try {
      const res = await postV1AdminUsersOnlineStatusList({ user_ids: chunk });
      const seen = new Set<string>();
      (res.data?.list || []).forEach((item) => {
        if (!item.user_id) return;
        map.set(item.user_id, !!item.online);
        seen.add(item.user_id);
      });
      // 契约：无在线记录视为 offline
      chunk.forEach((id) => {
        if (!seen.has(id) && !map.has(id)) map.set(id, false);
      });
    } catch {
      // Presence 失败时留给调用方按 unknown 处理
    }
  }
  return map;
}

export function onlineBooleanToStatus(
  online?: boolean | null
): AdminAPI.OnlineStatus {
  if (online == null) return 'unknown';
  return online ? 'online' : 'offline';
}

/** 给 AdminUserWrap 列表补齐 online_status（覆盖列表接口自带字段） */
export async function attachUsersOnlineStatus<
  T extends { user?: { user_id?: string }; online_status?: AdminAPI.OnlineStatus }
>(rows: T[]): Promise<T[]> {
  if (!rows.length) return rows;
  const ids = rows
    .map((row) => row.user?.user_id)
    .filter((id): id is string => !!id);
  const map = await fetchUserOnlineStatusMap(ids);
  return rows.map((row) => {
    const id = row.user?.user_id;
    if (!id) return { ...row, online_status: 'unknown' as const };
    return {
      ...row,
      online_status: onlineBooleanToStatus(
        map.has(id) ? map.get(id) : undefined
      )
    };
  });
}

/** 查询单个用户在线状态 */
export async function fetchUserOnlineStatus(
  userId?: string | null
): Promise<AdminAPI.OnlineStatus> {
  const id = String(userId || '').trim();
  if (!id) return 'unknown';
  const map = await fetchUserOnlineStatusMap([id]);
  return onlineBooleanToStatus(map.has(id) ? map.get(id) : undefined);
}
