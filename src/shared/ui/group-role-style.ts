import type React from 'react';

import { getRoleTagColor } from '@shared/lib/userAvatar';

/** 群主和管理员昵称使用与角色标签一致的稳定颜色。 */
export function groupRoleNameStyle(
  userId?: string | null,
  roleLevel?: number | null
): React.CSSProperties | undefined {
  if (roleLevel !== 100 && roleLevel !== 60) return undefined;
  return { color: getRoleTagColor(String(userId || '')) };
}
