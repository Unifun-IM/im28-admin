import React, { useEffect, useMemo, useState } from 'react';
import {
  Descriptions,
  Drawer,
  Input,
  Spin
} from '@arco-design/web-react';
import { IconLeft, IconRight, IconSearch } from '@arco-design/web-react/icon';
import { postV1AdminGroupsMembersList } from '@shared/api/admin/groups';
import { postV1AdminUsersDetail } from '@shared/api/admin/users';
import {
  GroupRoleTag,
  groupRoleNameStyle,
  StatusBadge,
  UserAvatar
} from '@shared/ui';
import { imLabel } from '@shared/lib/imLabels';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';
import { fetchUserOnlineStatus } from '@shared/lib/userOnlineStatus';
import '@features/user-detail/ui/user-detail-drawer.less';

export type GroupMemberListDrawerProps = {
  visible: boolean;
  groupId?: string | null;
  /** 群成员总数（展示用，无则用列表 length） */
  memberTotal?: number;
  onClose: () => void;
};

type MemberItem = {
  id?: string;
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

function formatPhone(phone?: string | null, areaCode?: string | null) {
  const raw = String(phone || '').trim();
  if (!raw || raw === '-') return '-';
  if (raw.startsWith('+')) return raw;
  const area = String(areaCode || '').trim();
  if (area) return `${area} ${raw}`;
  if (/^1\d{10}$/.test(raw)) return `+86 ${raw}`;
  return raw;
}

function displayName(user?: AdminAPI.User | null, fallback = '-') {
  return user?.nickname || user?.account || user?.user_id || fallback;
}

function mapMember(
  t: Record<string, string>,
  wrap: AdminAPI.AdminGroupMemberWrap
): MemberItem {
  const member = wrap.member;
  const user = wrap.user;
  const userId = member?.user_id || user?.user_id;
  const groupNick = member?.nickname?.trim();
  return {
    id: userId,
    userId,
    nickname: groupNick || displayName(user, userId || '-'),
    avatar: user?.avatar_url,
    roleLevel: member?.role,
    joinTime: formatDateTime(member?.joined_at, undefined, '-'),
    adminSince: formatDateTime(member?.admin_since, undefined, '-'),
    account: user?.account,
    phone: user?.phone,
    phoneAreaCode: user?.phone_area_code
  };
}

/**
 * 群详情 · 群成员列表（独立 Drawer，交互样式与原先内嵌成员列表一致）
 */
export default function GroupMemberListDrawer({
  visible,
  groupId,
  memberTotal,
  onClose
}: GroupMemberListDrawerProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [wraps, setWraps] = useState<AdminAPI.AdminGroupMemberWrap[]>([]);
  const [keyword, setKeyword] = useState('');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [activeMember, setActiveMember] = useState<MemberItem | null>(null);
  const [memberUser, setMemberUser] =
    useState<AdminAPI.AdminDetailUserEnvelope['data']>();
  const [memberOnline, setMemberOnline] =
    useState<AdminAPI.OnlineStatus>('unknown');

  useEffect(() => {
    if (!visible) return;
    setKeyword('');
    setView('list');
    setActiveMember(null);
    setMemberUser(undefined);
    setMemberOnline('unknown');
  }, [visible, groupId]);

  useEffect(() => {
    if (!visible || !groupId) return;
    let cancelled = false;
    setLoading(true);
    postV1AdminGroupsMembersList({
      group_id: groupId,
      page: 1,
      page_size: 100
    })
      .then((res) => {
        if (cancelled) return;
        setWraps(res.data?.list || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, groupId]);

  useEffect(() => {
    if (view !== 'detail' || !activeMember?.userId) {
      setMemberUser(undefined);
      setMemberOnline('unknown');
      return;
    }
    let cancelled = false;
    setMemberLoading(true);
    Promise.all([
      postV1AdminUsersDetail({ user_id: activeMember.userId }),
      fetchUserOnlineStatus(activeMember.userId)
    ])
      .then(([res, online]) => {
        if (cancelled) return;
        setMemberUser(res.data);
        setMemberOnline(online);
      })
      .catch(() => {
        if (cancelled) return;
        setMemberUser(undefined);
        setMemberOnline('unknown');
      })
      .finally(() => {
        if (!cancelled) setMemberLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view, activeMember?.userId]);

  const members = useMemo(
    () => wraps.map((wrap) => mapMember(t, wrap)),
    [wraps, t]
  );

  const filteredMembers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        String(m.nickname || '')
          .toLowerCase()
          .includes(q) ||
        String(m.userId || '')
          .toLowerCase()
          .includes(q)
    );
  }, [members, keyword]);

  const total = memberTotal ?? members.length;
  const memberProfile = memberUser?.user;
  const memberOnlineOk = memberOnline === 'online';

  const handleBack = () => {
    if (view === 'detail') {
      setActiveMember(null);
      setMemberUser(undefined);
      setMemberOnline('unknown');
      setView('list');
      return;
    }
    onClose();
  };

  const titleText =
    view === 'detail'
      ? t['groupDetail.member.title']
      : t['groupDetail.members.title'];

  return (
    <Drawer
      className="use-user-detail-drawer use-group-detail-drawer"
      width="50%"
      visible={visible}
      placement="right"
      title={
        <div className="flex w-full items-center gap-[16px]">
          <button
            type="button"
            className="inline-flex size-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-1"
            aria-label={t['groupDetail.back']}
            onClick={handleBack}
          >
            <IconLeft className="text-[16px]" />
          </button>
          <span>{titleText}</span>
        </div>
      }
      footer={null}
      unmountOnExit
      maskClosable
      onCancel={onClose}
    >
      <Spin
        loading={loading || (view === 'detail' && memberLoading)}
        className="use-user-detail-drawer-spin"
      >
        <div className="use-user-detail-drawer-body">
          {view === 'list' && (
            <div className="flex flex-col gap-[12px]">
              <Input
                allowClear
                placeholder={t['groupDetail.members.search']}
                prefix={<IconSearch className="text-arco-text-3" />}
                value={keyword}
                onChange={setKeyword}
              />
              <div className="text-[14px] leading-[21px] text-arco-text-2">
                {t['groupDetail.members.total'].replace(
                  '{n}',
                  String(keyword.trim() ? filteredMembers.length : total)
                )}
              </div>
              <div className="flex flex-col gap-[16px]">
                {filteredMembers.map((m) => (
                  <button
                    key={m.id || m.userId}
                    type="button"
                    className="flex min-h-[56px] w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
                    onClick={() => {
                      setActiveMember(m);
                      setView('detail');
                    }}
                  >
                    <div className="flex items-center gap-[16px]">
                      <UserAvatar
                        size={40}
                        className="use-user-detail-avatar shrink-0 !text-[14px]"
                        userId={m.userId}
                        name={m.nickname}
                        src={m.avatar}
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[14px] font-medium leading-[21px] text-arco-text-2"
                            style={groupRoleNameStyle(m.userId, m.roleLevel)}
                          >
                            {m.nickname || '-'}
                          </span>
                          <GroupRoleTag
                            userId={m.userId}
                            roleLevel={m.roleLevel}
                          />
                        </div>
                        <div className="text-[12px] leading-[20px] text-arco-text-3">
                          ID：{m.userId || '-'}
                        </div>
                      </div>
                    </div>
                    <IconRight className="text-[16px] text-arco-text-3" />
                  </button>
                ))}
                {!loading && !filteredMembers.length ? (
                  <div className="py-8 text-center text-[12px] text-arco-text-3">
                    {t['groupDetail.members.empty']}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {view === 'detail' && activeMember && (
            <div className="flex flex-col gap-[12px]">
              <div className="flex h-[56px] items-center gap-[16px]">
                <UserAvatar
                  size={56}
                  className="use-user-detail-avatar shrink-0"
                  userId={memberProfile?.user_id || activeMember.userId}
                  name={memberProfile?.nickname || activeMember.nickname}
                  src={memberProfile?.avatar_url || activeMember.avatar}
                />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1">
                    <span
                      className="truncate text-[17.5px] font-bold leading-[24.5px] text-arco-text-1"
                      style={groupRoleNameStyle(
                        memberProfile?.user_id || activeMember.userId,
                        activeMember.roleLevel
                      )}
                    >
                      {memberProfile?.nickname ||
                        activeMember.nickname ||
                        '-'}
                    </span>
                    <GroupRoleTag
                      userId={
                        memberProfile?.user_id || activeMember.userId
                      }
                      roleLevel={activeMember.roleLevel}
                    />
                  </div>
                  <div className="mt-[2px]">
                    <StatusBadge
                      status={memberOnlineOk ? 'success' : 'default'}
                      text={imLabel(t, 'online', memberOnline)}
                      className="!text-[14px] !leading-[21px] !text-arco-text-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                  {t['groupDetail.member.section.basic']}
                </div>
                <Descriptions
                  className="use-user-detail-descriptions"
                  border
                  column={2}
                  size="small"
                  tableLayout="fixed"
                  data={[
                    {
                      label: t['groupDetail.member.field.userId'],
                      value: String(
                        memberProfile?.user_id || activeMember.userId || '-'
                      )
                    },
                    {
                      label: t['groupDetail.member.field.account'],
                      value: String(
                        memberProfile?.account || activeMember.account || '-'
                      )
                    },
                    {
                      label: t['groupDetail.member.field.phone'],
                      value: formatPhone(
                        memberProfile?.phone || activeMember.phone,
                        memberProfile?.phone_area_code ||
                          activeMember.phoneAreaCode
                      )
                    },
                    {
                      label: t['groupDetail.member.field.joinedAt'],
                      value: String(activeMember.joinTime || '-')
                    },
                    ...(activeMember.adminSince &&
                    activeMember.adminSince !== '-'
                      ? [
                          {
                            label: t['groupDetail.member.field.adminSince'],
                            value: String(activeMember.adminSince)
                          }
                        ]
                      : [])
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </Spin>
    </Drawer>
  );
}
