import React, { useEffect, useState } from 'react';
import { Descriptions, Drawer, Spin } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
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

export type GroupMemberDetailDrawerProps = {
  visible: boolean;
  userId?: string | null;
  /** 群内已知信息（角色、入群时间等），可来自成员列表 / managers / owner */
  seed?: GroupMemberDetailSeed | null;
  onClose: () => void;
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
    nickname:
      groupNick || user?.nickname || user?.account || userId || '-',
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
 * 群场景用户详情 Drawer（与通用 UserDetailDrawer 分离）
 * 样式沿用原群成员内嵌详情
 */
export default function GroupMemberDetailDrawer({
  visible,
  userId,
  seed,
  onClose
}: GroupMemberDetailDrawerProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [memberUser, setMemberUser] =
    useState<AdminAPI.AdminDetailUserEnvelope['data']>();
  const [memberOnline, setMemberOnline] =
    useState<AdminAPI.OnlineStatus>('unknown');

  const activeId = userId || seed?.userId || null;

  useEffect(() => {
    if (!visible || !activeId) {
      setMemberUser(undefined);
      setMemberOnline('unknown');
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      postV1AdminUsersDetail({ user_id: activeId }),
      fetchUserOnlineStatus(activeId)
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
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, activeId]);

  const profile = memberUser?.user;
  const onlineOk = memberOnline === 'online';
  const roleLevel = seed?.roleLevel;
  const displayUserId = profile?.user_id || seed?.userId || activeId || '-';
  const displayName =
    profile?.nickname || seed?.nickname || displayUserId || '-';
  const displayAvatar = profile?.avatar_url || seed?.avatar;
  const joinTime = seed?.joinTime || '-';
  const adminSince = seed?.adminSince;

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
            onClick={onClose}
          >
            <IconLeft className="text-[16px]" />
          </button>
          <span>{t['groupDetail.member.title']}</span>
        </div>
      }
      footer={null}
      unmountOnExit
      maskClosable
      onCancel={onClose}
    >
      <Spin loading={loading} className="use-user-detail-drawer-spin">
        <div className="use-user-detail-drawer-body">
          <div className="flex flex-col gap-[12px]">
            <div className="flex h-[56px] items-center gap-[16px]">
              <UserAvatar
                size={56}
                className="use-user-detail-avatar shrink-0"
                userId={displayUserId}
                name={displayName}
                src={displayAvatar}
              />
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1">
                  <span
                    className="truncate text-[17.5px] font-bold leading-[24.5px] text-arco-text-1"
                    style={groupRoleNameStyle(displayUserId, roleLevel)}
                  >
                    {displayName}
                  </span>
                  <GroupRoleTag userId={displayUserId} roleLevel={roleLevel} />
                </div>
                <div className="mt-[2px]">
                  <StatusBadge
                    status={onlineOk ? 'success' : 'default'}
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
                    value: String(displayUserId)
                  },
                  {
                    label: t['groupDetail.member.field.account'],
                    value: String(
                      profile?.account || seed?.account || '-'
                    )
                  },
                  {
                    label: t['groupDetail.member.field.phone'],
                    value: formatGroupMemberPhone(
                      profile?.phone || seed?.phone,
                      profile?.phone_area_code || seed?.phoneAreaCode
                    )
                  },
                  {
                    label: t['groupDetail.member.field.joinedAt'],
                    value: String(joinTime)
                  },
                  ...(adminSince && adminSince !== '-'
                    ? [
                        {
                          label: t['groupDetail.member.field.adminSince'],
                          value: String(adminSince)
                        }
                      ]
                    : [])
                ]}
              />
            </div>
          </div>
        </div>
      </Spin>
    </Drawer>
  );
}
