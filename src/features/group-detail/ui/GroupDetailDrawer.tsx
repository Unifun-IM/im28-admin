import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Spin,
  Tabs
} from '@arco-design/web-react';
import {
  postV1AdminGroupsDetail,
  postV1AdminGroupsMembersList,
  postV1AdminGroupsOperationLogsList
} from '@shared/api/admin/groups';
import {
  StatusBadge,
  UserAvatar,
  DetailLinkRow
} from '@shared/ui';
import { BizOperationTimeline } from '@widgets/biz-operation-timeline';
import { UserDetailDrawer } from '@features/user-detail';
import { imLabel } from '@shared/lib/imLabels';
import { getAvatarLetter } from '@shared/lib/userAvatar';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';
import GroupMemberListDrawer from './GroupMemberListDrawer';
import '@features/user-detail/ui/user-detail-drawer.less';

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
    <DetailLinkRow showArrow={false} onClick={onClick}>
      {children}
    </DetailLinkRow>
  );
}

function SocialLink({
  value,
  onClick
}: {
  value: React.ReactNode;
  onClick?: () => void;
}) {
  return <DetailLinkRow onClick={onClick}>{value}</DetailLinkRow>;
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
 * Figma 977:22817 基本信息 / 977:22961 操作日志
 * 群主/管理员 → 独立 UserDetailDrawer；群成员 → 独立 GroupMemberListDrawer
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
  const [detail, setDetail] =
    useState<AdminAPI.AdminDetailGroupEnvelope['data']>();
  const [logs, setLogs] = useState<AdminAPI.AdminGroupOperationLogWrap[]>([]);
  const [memberWraps, setMemberWraps] = useState<
    AdminAPI.AdminGroupMemberWrap[]
  >([]);
  const [tab, setTab] = useState<string>(defaultTab);
  const [membersListVisible, setMembersListVisible] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTab(defaultTab);
    setMembersListVisible(false);
    setDetailUserId(null);
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
      // 摘要头像九宫格用
      postV1AdminGroupsMembersList({
        group_id: groupId,
        page: 1,
        page_size: 9
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

  const openUserDetail = (userId?: string | null) => {
    if (!userId) return;
    setDetailUserId(userId);
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

  return (
    <>
    <Drawer
      className="use-user-detail-drawer use-group-detail-drawer"
      width="50%"
      visible={visible}
      placement="right"
      title={t['groupDetail.title']}
      footer={
        <Button type="primary" long onClick={openChat}>
          {t['groupDetail.action.viewChat']}
        </Button>
      }
      unmountOnExit
      maskClosable
      onCancel={onClose}
    >
      <Spin loading={loading} className="use-user-detail-drawer-spin">
        <div className="use-user-detail-drawer-body">
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
                                openUserDetail(
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
                              onClick={() => setMembersListVisible(true)}
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
                                openUserDetail(
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
                                onClick={() => openUserDetail(a.userId)}
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
                  <BizOperationTimeline
                    className="use-group-detail-timeline"
                    items={timelineItems.map((item) => ({
                      key: item.id || String(item.time),
                      time: item.time,
                      action: item.action || '-',
                      detail: item.detail || ''
                    }))}
                    empty={
                      !loading ? (
                        <div className="py-8 text-center text-[12px] text-arco-text-3">
                          {t['groupDetail.logs.empty']}
                        </div>
                      ) : null
                    }
                  />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </>
        </div>
      </Spin>
    </Drawer>
      <GroupMemberListDrawer
        visible={membersListVisible}
        groupId={groupId}
        memberTotal={memberTotal}
        onClose={() => setMembersListVisible(false)}
      />
      <UserDetailDrawer
        visible={!!detailUserId}
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />
    </>
  );
}
