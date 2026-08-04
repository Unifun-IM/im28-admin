import React, { useEffect, useMemo, useState } from 'react';
import {
  Descriptions,
  Drawer,
  Message,
  Spin,
  Tabs,
  Timeline
} from '@arco-design/web-react';
import { IconCopy, IconRight } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import {
  postV1AdminUsersDetail,
  postV1AdminUsersOperationLogsList
} from '@shared/api/admin/users';
import { StatusBadge, UserAvatar } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';
import UserRelationListModal from './UserRelationListModal';
import './user-detail-drawer.less';
import '@shared/ui/biz-detail-table.less';

export type UserDetailDrawerProps = {
  visible: boolean;
  userId?: string | null;
  /** 默认打开的 Tab */
  defaultTab?: 'basic' | 'logs';
  onClose: () => void;
};

function formatPhone(
  phone?: string | null,
  areaCode?: string | null
): string {
  const raw = String(phone || '').trim();
  if (!raw) return '--';
  if (raw.startsWith('+')) return raw;
  const area = String(areaCode || '').trim();
  if (area) return `${area} ${raw}`;
  if (/^1\d{10}$/.test(raw)) return `+86 ${raw}`;
  return raw;
}

function CopyValue({ value }: { value: string }) {
  const common = useLocale();
  return (
    <span className="inline-flex items-center gap-[8px]">
      <span className="text-[12px] leading-[22px] text-arco-text-1">{value}</span>
      <button
        type="button"
        className="inline-flex size-[10px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-3 hover:text-arco-text-1"
        aria-label={common['common.copy']}
        onClick={() => {
          copy(value);
          Message.success(common['common.copied']);
        }}
      >
        <IconCopy className="text-[10px]" />
      </button>
    </span>
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

function logDetailText(
  t: Record<string, string>,
  log?: AdminAPI.AdminUserOperationLog
): string {
  if (!log) return '';
  const parts: string[] = [];
  if (log.status === 'success') parts.push(t['userLogs.status.success']);
  if (log.status === 'failed') parts.push(t['userLogs.status.failed']);
  const client = log.client;
  if (client?.type) {
    parts.push(
      [t[`userLogs.client.${client.type}`] || client.type, client.version]
        .filter(Boolean)
        .join(' ')
    );
  }
  const location = log.location;
  if (location?.region || location?.ip) {
    parts.push([location.region, location.ip].filter(Boolean).join(' / '));
  }
  if (log.remark) parts.push(log.remark);
  return parts.filter(Boolean).join(' · ');
}

/**
 * 用户详情抽屉 — Figma 1125:26019（基本信息）/ 750:23153（操作日志 Timeline）
 * 宽 640；对接 AdminAPI，交互按稿面保留
 */
export default function UserDetailDrawer({
  visible,
  userId,
  defaultTab = 'basic',
  onClose
}: UserDetailDrawerProps) {
  const t = useLocale();
  const common = t;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] =
    useState<AdminAPI.AdminDetailUserEnvelope['data']>();
  const [logs, setLogs] = useState<AdminAPI.AdminUserOperationLogWrap[]>([]);
  const [tab, setTab] = useState<string>(defaultTab);
  const [relationMode, setRelationMode] = useState<'friends' | 'groups' | null>(
    null
  );

  useEffect(() => {
    if (!visible) return;
    setTab(defaultTab);
  }, [visible, defaultTab]);

  useEffect(() => {
    if (!visible || !userId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      postV1AdminUsersDetail({ user_id: userId }),
      postV1AdminUsersOperationLogsList({
        keyword: userId,
        keyword_type: 'user_id',
        sort_order: 'desc',
        page: 1,
        page_size: 50
      })
    ])
      .then(([detailRes, logsRes]) => {
        if (cancelled) return;
        setDetail(detailRes.data);
        setLogs(logsRes.data?.list || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, userId]);

  const user = detail?.user;
  const nickname = user?.nickname || '--';
  /** 头像旁展示账号态（正常/已拉黑），不展示 online unknown「未知」 */
  const accountStatus = user?.status;
  const accountStatusOk = accountStatus === 'active';
  const accountStatusBanned = accountStatus === 'disabled';
  const accountStatusLabel = accountStatusBanned
    ? t['userQuery.status.disabled']
    : accountStatusOk
      ? t['userQuery.status.active']
      : '--';
  const accountStatusBadge: 'success' | 'error' | 'default' =
    accountStatusOk ? 'success' : accountStatusBanned ? 'error' : 'default';

  const timelineItems = useMemo(
    () =>
      logs.map((item, index) => {
        const log = item.log;
        const behavior =
          (log?.behavior_type &&
            t[`userLogs.behavior.${log.behavior_type}`]) ||
          log?.behavior_type ||
          '--';
        return {
          key: log?.log_id || `${log?.operated_at}-${index}`,
          time: formatDateTime(
            log?.operated_at,
            'YYYY/MM/DD HH:mm:ss',
            '--'
          ),
          action: behavior,
          detail: logDetailText(t, log)
        };
      }),
    [logs, t]
  );

  return (
    <>
    <Drawer
      className="use-user-detail-drawer"
      width={640}
      visible={visible}
      placement="right"
      title={t['userDetail.title']}
      footer={null}
      unmountOnExit
      maskClosable
      onCancel={onClose}
      maskStyle={{
        background: 'var(--color-mask-1)',
        backdropFilter: 'blur(3.5px)'
      }}
    >
      <Spin loading={loading} className="block w-full">
        <div className="flex flex-col gap-[12px]">
          <div className="flex h-[56px] items-center gap-[16px]">
            <UserAvatar
              size={56}
              className="use-user-detail-avatar shrink-0"
              userId={user?.user_id || userId}
              name={nickname === '--' ? '' : nickname}
              src={user?.avatar_url}
            />
            <div className="min-w-0">
              <div className="truncate text-[17.5px] font-bold leading-[24.5px] text-arco-text-1">
                {nickname}
              </div>
              <div className="mt-[2px]">
                <StatusBadge
                  status={accountStatusBadge}
                  text={accountStatusLabel}
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
            <Tabs.TabPane key="basic" title={t['userDetail.tab.basic']}>
              <div className="flex flex-col gap-[12px] pt-[12px]">
                <div>
                  <div className="use-user-detail-section-title">
                    {t['userDetail.section.basic']}
                  </div>
                  <Descriptions
                    className="use-user-detail-descriptions"
                    border
                    column={2}
                    size="small"
                    tableLayout="fixed"
                    data={[
                      {
                        label: t['userDetail.field.userId'],
                        value: user?.user_id || '--'
                      },
                      {
                        label: t['userDetail.field.account'],
                        value: (
                          <CopyValue value={user?.account || '--'} />
                        )
                      },
                      {
                        label: t['userDetail.field.phone'],
                        value: formatPhone(
                          user?.phone,
                          user?.phone_area_code
                        )
                      },
                      {
                        label: t['userDetail.field.email'],
                        value: user?.email || '--'
                      },
                      {
                        label: t['userDetail.field.createdAt'],
                        value: formatDateTime(user?.created_at)
                      },
                      {
                        label: t['userDetail.field.lastActiveAt'],
                        value: formatDateTime(user?.last_login_at)
                      }
                    ]}
                  />
                </div>

                <div>
                  <div className="use-user-detail-section-title">
                    {t['userDetail.section.social']}
                  </div>
                  <Descriptions
                    className="use-user-detail-descriptions"
                    border
                    column={2}
                    size="small"
                    tableLayout="fixed"
                    data={[
                      {
                        label: t['userDetail.field.friendCount'],
                        value: (
                          <SocialLink
                            value={detail?.friend_count ?? 0}
                            onClick={() => setRelationMode('friends')}
                          />
                        )
                      },
                      {
                        label: t['userDetail.field.groupCount'],
                        value: (
                          <SocialLink
                            value={detail?.group_count ?? 0}
                            onClick={() => setRelationMode('groups')}
                          />
                        )
                      }
                    ]}
                  />
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="logs" title={t['userDetail.tab.logs']}>
              <div className="pt-[12px]">
                {timelineItems.length ? (
                  <Timeline className="use-user-detail-timeline">
                    {timelineItems.map((item, index) => (
                      <Timeline.Item
                        key={item.key}
                        dotColor={
                          index === 0
                            ? 'rgb(var(--primary-6))'
                            : 'var(--color-neutral-3, #c9cdd4)'
                        }
                      >
                        <div className="flex items-start gap-[12px] text-[12px] leading-[20px]">
                          <span className="w-[119px] shrink-0 text-arco-text-3">
                            {item.time}
                          </span>
                          <span className="flex min-w-0 flex-1 items-center gap-[12px]">
                            <span className="w-[200px] shrink-0 text-arco-text-1">
                              {item.action}
                            </span>
                            <span className="min-w-0 shrink truncate text-arco-text-3">
                              {item.detail}
                            </span>
                          </span>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  !loading && (
                    <div className="py-8 text-center text-[12px] text-arco-text-3">
                      {t['userDetail.logs.empty']}
                    </div>
                  )
                )}
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Spin>
    </Drawer>
      <UserRelationListModal
        visible={!!relationMode}
        mode={relationMode || 'friends'}
        userId={userId}
        onClose={() => setRelationMode(null)}
      />
    </>
  );
}
