import { formatDateTime } from '@shared/lib/formatTime';

export type GroupMemberDetailSeed = {
  userId?: string;
  nickname?: string;
  avatar?: string;
  roleLevel?: AdminAPI.RoleLevel;
  joinTime?: string;
  adminSince?: string;
  account?: string;
  phone?: string;
  phoneAreaCode?: string;
};

export function formatGroupMemberPhone(
  phone?: string | null,
  areaCode?: string | null
) {
  const raw = String(phone || '').trim();
  if (!raw || raw === '-') return '-';
  if (raw.startsWith('+')) return raw;
  const area = String(areaCode || '').trim();
  if (area) return `${area} ${raw}`;
  if (/^1\d{10}$/.test(raw)) return `+86 ${raw}`;
  return raw;
}

export function mapGroupMemberSeed(
  wrap: AdminAPI.AdminGroupMemberWrap
): GroupMemberDetailSeed {
  const member = wrap.member;
  const user = wrap.user;
  const userId = member?.user_id || user?.user_id;
  const groupNick = member?.nickname?.trim();
  return {
    userId,
    nickname: groupNick || user?.nickname || user?.account || userId || '-',
    avatar: user?.avatar_url,
    roleLevel: member?.role,
    joinTime: formatDateTime(member?.joined_at, undefined, '-'),
    adminSince: formatDateTime(member?.admin_since, undefined, '-'),
    account: user?.account,
    phone: user?.phone,
    phoneAreaCode: user?.phone_area_code
  };
}
