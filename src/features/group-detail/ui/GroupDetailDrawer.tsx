import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Input,
  Spin,
  Tabs,
  Timeline
} from '@arco-design/web-react';
import {
  IconLeft,
  IconRight,
  IconSearch
} from '@arco-design/web-react/icon';
import {
  postV1AdminGroupsDetail,
  postV1AdminGroupsMembersList,
  postV1AdminGroupsOperationLogsList
} from '@shared/api/admin/groups';
import { postV1AdminUsersDetail } from '@shared/api/admin/users';
import {
  GroupRoleTag,
  groupRoleNameStyle,
  StatusBadge,
  UserAvatar
} from '@shared/ui';
import { imLabel } from '@shared/lib/imLabels';
import { getAvatarLetter } from '@shared/lib/userAvatar';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';
import { fetchUserOnlineStatus } from '@shared/lib/userOnlineStatus';
import '@features/user-detail/ui/user-detail-drawer.less';
import '@shared/ui/biz-detail-table.less';

export type GroupDetailDrawerProps = {
  visible: boolean;
  groupId?: string | null;
  defaultTab?: 'basic' | 'logs';
  onClose: () => void;
  /** 查看聊天：交给页面打开同一 UserChatModal（scene=group） */
  onViewChat?: (payload: {
    groupId: string;
    groupName: string;
    memberCount?: number;
    ownerId?: string;
  }) => void;
};

type MemberItem = {
  id?: string;
  userId?: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  roleLevel?: AdminAPI.RoleLevel;
  joinTime?: string;
  /** 成为管理员时间 */
  adminSince?: string;
  account?: string;
  phone?: string;
  phoneAreaCode?: string;
};

type LogItem = {
  id?: string;
  time?: string;
  action?: string;
  detail?: string;
};

type View = 'main' | 'members' | 'member';

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

function mapGroupMemberWrap(
  t: Record<string, string>,
  wrap: { member?: AdminAPI.GroupMember; user?: AdminAPI.User }
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
    role: imLabel(t, 'roleLevel', member?.role),
    roleLevel: member?.role,
    joinTime: formatDateTime(member?.joined_at, undefined, '-'),
    adminSince: formatDateTime(member?.admin_since, undefined, '-'),
    account: user?.account,
    phone: user?.phone,
    phoneAreaCode: user?.phone_area_code
  };
}

function logDetailText(
  item: AdminAPI.AdminGroupOperationLogWrap,
  actionLabel?: string
): string {
  const log = item.log;
  if (!log) return '';
  const parts: string[] = [];
  // description 常与操作类型中文一致，已在 action 列展示时不再重复
  if (
    log.description &&
    (!actionLabel || log.description !== actionLabel)
  ) {
    parts.push(log.description);
  }
  const operator =
    item.operator_user?.nickname ||
    item.operator_user?.user_id ||
    item.operator_sys_user?.display_name ||
    item.operator_sys_user?.username ||
    (item.operator_sys_user?.id != null
      ? String(item.operator_sys_user.id)
      : undefined) ||
    log.operator_user_id ||
    (log.operator_sys_user_id != null
      ? String(log.operator_sys_user_id)
      : undefined);
  if (operator) parts.push(String(operator));
  if (log.target_user_ids?.length) {
    parts.push(log.target_user_ids.join(', '));
  }
  return parts.join(' · ');
}

function LinkValue({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent p-0 text-[14px] leading-[21px] text-[rgb(var(--link-6))]"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SocialLink({
  value,
  onClick
}: {
  value: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
      onClick={onClick}
    >
      <span className="text-[14px] leading-[21px] text-[rgb(var(--link-6))]">
        {value}
      </span>
      <IconRight className="text-[14px] text-arco-text-3" />
    </button>
  );
}

/** 群头像：稿面九宫格；无成员时回退群头像 */
function GroupAvatar({
  name,
  avatarUrl,
  members
}: {
  name: string;
  avatarUrl?: string;
  members: MemberItem[];
}) {
  if (!members.length && avatarUrl) {
    return (
      <UserAvatar
        size={56}
        className="use-user-detail-avatar shrink-0"
        name={name}
        src={avatarUrl}
      />
    );
  }
  const cells = Array.from({ length: 9 }, (_, i) => members[i]);
  return (
    <div className="box-border grid size-[56px] shrink-0 grid-cols-3 grid-rows-3 gap-[1.4px] overflow-hidden rounded-[8.4px] bg-[var(--color-fill-3)]">
      {cells.map((m, i) => (
        <div
          key={m?.id || i}
          className="flex items-center justify-center overflow-hidden bg-[var(--color-primary-light)] text-[8px] font-bold text-[rgb(var(--primary-6))]"
        >
          {m?.avatar ? (
            <img alt="" src={m.avatar} className="size-full object-cover" />
          ) : (
            getAvatarLetter(m?.nickname || name)
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * 群详情 Drawer
 * Figma 977:22817 基本信息 / 977:22961 操作日志 / 977:23026 群成员 / 977:23094 成员用户信息
 * 成员列表：postV1AdminGroupsMembersList；管理区管理员：detail.managers
 */
export default function GroupDetailDrawer({
  visible,
  groupId,
  defaultTab = 'basic',
  onClose,
  onViewChat
}: GroupDetailDrawerProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [detail, setDetail] =
    useState<AdminAPI.AdminDetailGroupEnvelope['data']>();
  const [logs, setLogs] = useState<AdminAPI.AdminGroupOperationLogWrap[]>([]);
  const [memberWraps, setMemberWraps] = useState<
    AdminAPI.AdminGroupMemberWrap[]
  >([]);
  const [tab, setTab] = useState<string>(defaultTab);
  const [view, setView] = useState<View>('main');
  const [memberKeyword, setMemberKeyword] = useState('');
  const [activeMember, setActiveMember] = useState<MemberItem | null>(null);
  const [memberFrom, setMemberFrom] = useState<'main' | 'members'>('members');
  const [memberUser, setMemberUser] =
    useState<AdminAPI.AdminDetailUserEnvelope['data']>();
  const [memberOnline, setMemberOnline] =
    useState<AdminAPI.OnlineStatus>('unknown');

  useEffect(() => {
    if (!visible) return;
    setTab(defaultTab);
    setView('main');
    setMemberKeyword('');
    setActiveMember(null);
    setMemberFrom('members');
    setMemberUser(undefined);
    setMemberOnline('unknown');
    setMemberWraps([]);
  }, [visible, defaultTab, groupId]);

  useEffect(() => {
    if (!visible || !groupId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      postV1AdminGroupsDetail({ group_id: groupId }),
      postV1AdminGroupsOperationLogsList({
        group_id: groupId,
        page: 1,
        page_size: 50
      }),
      postV1AdminGroupsMembersList({
        group_id: groupId,
        page: 1,
        page_size: 100
      })
    ])
      .then(([detailRes, logsRes, membersRes]) => {
        if (cancelled) return;
        setDetail(detailRes.data);
        setLogs(logsRes.data?.list || []);
        setMemberWraps(membersRes.data?.list || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, groupId]);

  useEffect(() => {
    if (view !== 'member' || !activeMember?.userId) {
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

  const group = detail?.group;
  const name = group?.title || '-';
  const statusRaw = group?.status;
  const status = imLabel(t, 'groupStatus', statusRaw);

  const managers = useMemo(
    () =>
      (detail?.managers || []).map((wrap) => mapGroupMemberWrap(t, wrap)),
    [detail?.managers, t]
  );

  const members = useMemo(
    () => memberWraps.map((wrap) => mapGroupMemberWrap(t, wrap)),
    [memberWraps, t]
  );

  const timelineItems = useMemo<LogItem[]>(
    () =>
      logs.map((item, index) => {
        const log = item.log;
        const actionKey = log?.action;
        const actionLabel = actionKey
          ? t[`groupDetail.logAction.${actionKey}`] || actionKey
          : '-';
        return {
          id: log?.log_id || `${log?.operated_at}-${index}`,
          time: formatDateTime(log?.operated_at, 'YYYY/MM/DD HH:mm:ss', '-'),
          action: actionLabel,
          detail: logDetailText(item, actionLabel)
        };
      }),
    [logs, t]
  );

  const filteredMembers = useMemo(() => {
    const q = memberKeyword.trim().toLowerCase();
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
  }, [members, memberKeyword]);

  const ownerName = displayName(detail?.owner, group?.owner_user_id || '-');
  const creatorName = displayName(detail?.creator, ownerName);
  const memberTotal = group?.member_count ?? members.length;

  const joinMethod = group?.join_approval_required
    ? t['groupDetail.join.approval']
    : t['groupDetail.join.invite'];
  const invitePermission = group?.allow_member_invite
    ? t['groupDetail.switch.on']
    : t['groupDetail.switch.off'];
  const speakPermission =
    group?.send_frequency_enabled && group.send_frequency_seconds
      ? t['groupDetail.speak.seconds'].replace(
          '{n}',
          String(group.send_frequency_seconds)
        )
      : t['groupDetail.speak.unlimited'];
  const muteStatus = group?.mute_all
    ? t['groupDetail.mute.all']
    : group?.mute_member
      ? t['groupDetail.mute.member']
      : t['groupDetail.mute.none'];

  const titleText =
    view === 'members'
      ? t['groupDetail.members.title']
      : view === 'member'
        ? t['groupDetail.member.title']
        : t['groupDetail.title'];

  const openMember = (
    member: MemberItem,
    from: 'main' | 'members' = 'members'
  ) => {
    setMemberFrom(from);
    setActiveMember(member);
    setView('member');
  };

  const openMemberByUserId = (
    userId?: string,
    from: 'main' | 'members' = 'main'
  ) => {
    if (!userId) return;
    const found = members.find((m) => m.userId === userId);
    if (found) {
      openMember(found, from);
      return;
    }
    openMember(
      {
        id: userId,
        userId,
        nickname: userId
      },
      from
    );
  };

  const handleBack = () => {
    if (view === 'member') {
      setActiveMember(null);
      setMemberUser(undefined);
      setMemberOnline('unknown');
      setView(memberFrom);
      return;
    }
    if (view === 'members') {
      setView('main');
      setMemberKeyword('');
      return;
    }
    onClose();
  };

  const openChat = () => {
    const gid = String(group?.group_id || groupId || '');
    onViewChat?.({
      groupId: gid,
      groupName: String(group?.title || gid),
      memberCount: Number(group?.member_count || 0) || undefined,
      ownerId: String(group?.owner_user_id || detail?.owner?.user_id || '')
    });
    onClose();
  };

  const drawerTitle = (
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
  );

  const memberProfile = memberUser?.user;
  const memberOnlineOk = memberOnline === 'online';

  return (
    <Drawer
      className="use-user-detail-drawer use-group-detail-drawer"
      width={640}
      visible={visible}
      placement="right"
      title={drawerTitle}
      footer={
        view === 'main' ? (
          <Button type="primary" long onClick={openChat}>
            {t['groupDetail.action.viewChat']}
          </Button>
        ) : null
      }
      unmountOnExit
      maskClosable
      onCancel={onClose}
    >
      <Spin
        loading={loading || (view === 'member' && memberLoading)}
        className="use-user-detail-drawer-spin"
      >
        <div className="use-user-detail-drawer-body">
        {view === 'main' && (
          <>
            <div className="use-user-detail-summary flex h-[56px] items-center gap-[16px]">
              <GroupAvatar
                name={name}
                avatarUrl={group?.avatar_url}
                members={members}
              />
              <div className="min-w-0">
                <div className="truncate text-[17.5px] font-bold leading-[24.5px] text-arco-text-1">
                  {name}
                </div>
                <div className="mt-[2px]">
                  <StatusBadge
                    status={
                      statusRaw === 0
                        ? 'success'
                        : statusRaw === 1
                          ? 'error'
                          : statusRaw === 3
                            ? 'warning'
                            : 'default'
                    }
                    text={status || '-'}
                    className="!text-[14px] !leading-[21px] !text-arco-text-2"
                  />
                </div>
              </div>
            </div>

            <Tabs
              type="line"
              activeTab={tab}
              onChange={setTab}
              className="use-user-detail-tabs"
            >
              <Tabs.TabPane key="basic" title={t['groupDetail.tab.basic']}>
                <div className="flex flex-col gap-[12px] pt-[12px]">
                  <div>
                    <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                      {t['groupDetail.section.basic']}
                    </div>
                    <Descriptions
                      className="use-user-detail-descriptions"
                      border
                      column={2}
                      size="small"
                      tableLayout="fixed"
                      data={[
                        {
                          label: t['groupDetail.field.groupId'],
                          value: String(group?.group_id || groupId || '-')
                        },
                        {
                          label: t['groupDetail.field.owner'],
                          value: (
                            <LinkValue
                              onClick={() =>
                                openMemberByUserId(
                                  detail?.owner?.user_id ||
                                    group?.owner_user_id
                                )
                              }
                            >
                              {ownerName}
                            </LinkValue>
                          )
                        },
                        {
                          label: t['groupDetail.field.createdAt'],
                          value: formatDateTime(
                            group?.created_at,
                            undefined,
                            '-'
                          )
                        },
                        {
                          label: t['groupDetail.field.lastActiveAt'],
                          value: formatDateTime(
                            detail?.last_active_at || group?.updated_at,
                            undefined,
                            '-'
                          )
                        },
                        {
                          label: t['groupDetail.field.creator'],
                          value: creatorName
                        }
                      ]}
                    />
                  </div>

                  <div>
                    <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                      {t['groupDetail.section.members']}
                    </div>
                    <Descriptions
                      className="use-user-detail-descriptions"
                      border
                      column={1}
                      size="small"
                      tableLayout="fixed"
                      data={[
                        {
                          label: t['groupDetail.field.members'],
                          value: (
                            <SocialLink
                              value={String(memberTotal)}
                              onClick={() => setView('members')}
                            />
                          )
                        }
                      ]}
                    />
                  </div>

                  <div>
                    <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                      {t['groupDetail.section.settings']}
                    </div>
                    <Descriptions
                      className="use-user-detail-descriptions"
                      border
                      column={2}
                      size="small"
                      tableLayout="fixed"
                      data={[
                        {
                          label: t['groupDetail.field.joinMethod'],
                          value: joinMethod
                        },
                        {
                          label: t['groupDetail.field.invitePermission'],
                          value: invitePermission
                        },
                        {
                          label: t['groupDetail.field.speakPermission'],
                          value: speakPermission
                        },
                        {
                          label: t['groupDetail.field.muteStatus'],
                          value: muteStatus
                        }
                      ]}
                    />
                  </div>

                  <div>
                    <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                      {t['groupDetail.section.manage']}
                    </div>
                    <Descriptions
                      className="use-user-detail-descriptions"
                      border
                      column={2}
                      size="small"
                      tableLayout="fixed"
                      data={[
                        {
                          label: t['groupDetail.field.owner'],
                          value: (
                            <LinkValue
                              onClick={() =>
                                openMemberByUserId(
                                  detail?.owner?.user_id ||
                                    group?.owner_user_id
                                )
                              }
                            >
                              {ownerName}
                            </LinkValue>
                          )
                        },
                        ...managers
                          .filter((a) => a.roleLevel !== 100)
                          .slice(0, 5)
                          .map((a) => ({
                            label: t['groupDetail.field.admin'],
                            value: (
                              <LinkValue
                                key={a.userId || a.id}
                                onClick={() => openMember(a)}
                              >
                                {String(a.nickname || '-')}
                              </LinkValue>
                            )
                          }))
                      ]}
                    />
                  </div>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane key="logs" title={t['groupDetail.tab.logs']}>
                <div className="pt-[12px]">
                  {timelineItems.length ? (
                    <Timeline className="use-group-detail-timeline">
                      {timelineItems.map((item, index) => (
                        <Timeline.Item
                          key={item.id || `${item.time}-${index}`}
                          dotColor={
                            index === 0
                              ? 'rgb(var(--primary-6))'
                              : 'var(--color-neutral-3, #c9cdd4)'
                          }
                        >
                          <div className="flex items-start gap-[12px] text-[12px] leading-[20px]">
                            <span className="w-[140px] shrink-0 whitespace-nowrap text-arco-text-3">
                              {item.time}
                            </span>
                            <span className="flex min-w-0 flex-1 items-center gap-[12px]">
                              <span className="w-[200px] shrink-0 text-arco-text-1">
                                {item.action || '-'}
                              </span>
                              <span className="min-w-0 shrink truncate text-arco-text-3">
                                {item.detail || ''}
                              </span>
                            </span>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    !loading && (
                      <div className="py-8 text-center text-[12px] text-arco-text-3">
                        {t['groupDetail.logs.empty']}
                      </div>
                    )
                  )}
                </div>
              </Tabs.TabPane>
            </Tabs>
          </>
        )}

        {view === 'members' && (
          <div className="flex flex-col gap-[12px]">
            <Input
              allowClear
              placeholder={t['groupDetail.members.search']}
              prefix={<IconSearch className="text-arco-text-3" />}
              value={memberKeyword}
              onChange={setMemberKeyword}
            />
            <div className="text-[14px] leading-[21px] text-arco-text-2">
              {t['groupDetail.members.total'].replace(
                '{n}',
                String(
                  memberKeyword.trim()
                    ? filteredMembers.length
                    : memberTotal
                )
              )}
            </div>
            <div className="flex flex-col gap-[16px]">
              {filteredMembers.map((m) => (
                <button
                  key={m.id || m.userId}
                  type="button"
                  className="flex min-h-[56px] w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
                  onClick={() => openMember(m)}
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

        {view === 'member' && activeMember && (
          <div className="flex flex-col gap-[12px]">
            <div className="flex h-[56px] items-center gap-[16px]">
              <UserAvatar
                size={56}
                className="use-user-detail-avatar shrink-0"
                userId={
                  memberProfile?.user_id || activeMember.userId
                }
                name={
                  memberProfile?.nickname || activeMember.nickname
                }
                src={
                  memberProfile?.avatar_url || activeMember.avatar
                }
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
